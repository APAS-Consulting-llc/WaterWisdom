import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import { db } from "@db";
import { users, knowledgeEntries, userCredentials, userPublications, questions, userProgress, achievements, learningPaths, userLearningPaths, forumPosts, forumComments, forumReactions, badges, userBadges, badgeCategories, knowledgeVotes, knowledgeRevisions, userSkills, skillEndorsements, professionalGroups, professionalConnections, groupMemberships } from "@db/schema";
import { eq, and, count, avg, desc, sql } from "drizzle-orm";
import CollaborationService from "./services/collaborationService";
import { handleChatMessage } from './services/chatService';
import { startDailyQuizScheduler } from './services/schedulerService';
import { generateMicroLearning } from './services/microLearningService';
import express from 'express';
import { mkdir, existsSync } from 'fs';
import { promisify } from 'util';

const mkdirAsync = promisify(mkdir);

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Create uploads directory if it doesn't exist
  if (!existsSync('./uploads')) {
    mkdirAsync('./uploads').catch(console.error);
  }

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // File upload endpoint
  app.post("/api/upload", upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });

  // AI content generation endpoint
  app.post("/api/ai/generate-content", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const { prompt } = req.body;
      const enhancedContent = await handleChatMessage(prompt);
      res.json({ content: enhancedContent });
    } catch (error) {
      console.error("AI content generation error:", error);
      res.status(500).send("Failed to generate content");
    }
  });

  // Add user preferences endpoint
  app.post("/api/user/preferences", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    const {
      phoneNumber,
      enabled,
      preferredQuizTime,
      timezone,
      newsletterEnabled,
      newsletterFrequency,
      newsletterTopics,
    } = req.body;

    try {
      await db
        .update(users)
        .set({
          phoneNumber,
          smsNotificationsEnabled: enabled,
          preferredQuizTime,
          timezone,
          newsletterEnabled,
          newsletterFrequency,
          newsletterTopics,
        })
        .where(eq(users.id, req.user.id));

      res.json({ message: "Preferences updated successfully" });
    } catch (error) {
      res.status(500).send("Failed to update preferences");
    }
  });

  startDailyQuizScheduler();

  app.post("/api/chat", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).send("Invalid message");
    }

    try {
      const response = await handleChatMessage(message);
      res.json({ response });
    } catch (error) {
      console.error('Chat endpoint error:', error);
      res.status(500).send("Failed to process chat message");
    }
  });

  app.post("/api/user/sms-preferences", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    const { phoneNumber, enabled } = req.body;

    try {
      await db
        .update(users)
        .set({
          phoneNumber,
          smsNotificationsEnabled: enabled,
        })
        .where(eq(users.id, req.user.id));

      res.json({ message: "SMS preferences updated successfully" });
    } catch (error) {
      res.status(500).send("Failed to update SMS preferences");
    }
  });

  app.get("/api/questions", async (req, res) => {
    try {
      const { category, difficulty } = req.query;
      let query = db.select().from(questions).where(eq(questions.approved, true));

      if (category) {
        query = query.where(eq(questions.category, category as string));
      }
      if (difficulty) {
        query = query.where(eq(questions.difficulty, difficulty as string));
      }

      const questionsList = await query;
      res.json(questionsList);
    } catch (error) {
      res.status(500).send("Failed to fetch questions");
    }
  });

  app.post("/api/submit-answer", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    const { questionId, answer, category, difficulty, currentStreak } = req.body;
    try {
      const [question] = await db
        .select()
        .from(questions)
        .where(eq(questions.id, questionId));

      if (!question) {
        return res.status(404).send("Question not found");
      }

      const correct = answer.toLowerCase() === question.correctAnswer.toLowerCase();

      const [progress] = await db
        .insert(userProgress)
        .values({
          userId: req.user.id,
          questionId,
          correct,
        })
        .returning();

      const userStats = await db
        .select({
          total: count(),
          correct: count(userProgress.correct),
        })
        .from(userProgress)
        .where(and(
          eq(userProgress.userId, req.user.id),
          eq(questions.category, category)
        ))
        .innerJoin(questions, eq(userProgress.questionId, questions.id));

      const categoryAccuracy = await db
        .select({
          category: questions.category,
          accuracy: avg(userProgress.correct ? 1 : 0),
        })
        .from(userProgress)
        .innerJoin(questions, eq(userProgress.questionId, questions.id))
        .where(eq(userProgress.userId, req.user.id))
        .groupBy(questions.category);

      const categoryAccuracyMap = Object.fromEntries(
        categoryAccuracy.map(({ category, accuracy }) => [
          category,
          Number(accuracy) * 100,
        ])
      );

      const performanceMetrics: PerformanceMetrics = {
        correctAnswers: Number(userStats[0]?.correct || 0),
        totalQuestions: Number(userStats[0]?.total || 0),
        streakCount: correct ? currentStreak + 1 : 0,
        categoryAccuracy: categoryAccuracyMap,
      };

      const accuracy = (performanceMetrics.correctAnswers / performanceMetrics.totalQuestions) * 100;
      const recommendedDifficulty = calculateRecommendedDifficulty(
        difficulty as DifficultyLevel,
        accuracy,
        performanceMetrics.streakCount
      );

      await db
        .update(users)
        .set({
          streak: correct ? currentStreak + 1 : 0,
          points: req.user.points + (correct ? 10 : 0)
        })
        .where(eq(users.id, req.user.id));

      res.json({
        ...progress,
        performanceMetrics,
        recommendedDifficulty,
        explanation: question.explanation
      });
    } catch (error) {
      res.status(500).send("Failed to submit answer");
    }
  });

  app.post("/api/questions", async (req, res) => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).send("Not authorized");
    }

    try {
      const [question] = await db
        .insert(questions)
        .values({
          ...req.body,
          createdBy: req.user.id,
          approved: true,
        })
        .returning();

      res.json(question);
    } catch (error) {
      res.status(500).send("Failed to create question");
    }
  });

  app.get("/api/progress", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const progress = await db
        .select()
        .from(userProgress)
        .where(eq(userProgress.userId, req.user.id));

      res.json(progress);
    } catch (error) {
      res.status(500).send("Failed to fetch progress");
    }
  });

  app.get("/api/achievements", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const userAchievements = await db
        .select()
        .from(achievements)
        .where(eq(achievements.userId, req.user.id));

      res.json(userAchievements);
    } catch (error) {
      res.status(500).send("Failed to fetch achievements");
    }
  });

  app.post("/api/achievements/check", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const { points, streak, category, correctAnswers, totalQuestions } = req.body;
      const newAchievements: typeof achievements.$inferInsert[] = [];

      if (streak >= 5) {
        newAchievements.push({
          userId: req.user.id,
          type: 'streak',
          name: 'Hot Streak',
          description: 'Answer 5 questions correctly in a row',
          criteria: { streak: 5 },
          progress: { streak },
        });
      }

      if (points >= 100) {
        newAchievements.push({
          userId: req.user.id,
          type: 'points',
          name: 'Point Master',
          description: 'Earn 100 points',
          criteria: { points: 100 },
          progress: { points },
        });
      }

      if (category && correctAnswers === totalQuestions) {
        newAchievements.push({
          userId: req.user.id,
          type: 'category_mastery',
          name: `${category} Expert`,
          description: `Master the ${category} category`,
          criteria: { category, perfectScore: true },
          progress: { category, correctAnswers, totalQuestions },
        });
      }

      if (correctAnswers === totalQuestions && totalQuestions >= 5) {
        newAchievements.push({
          userId: req.user.id,
          type: 'perfect_score',
          name: 'Perfect Quiz',
          description: 'Complete a quiz with a perfect score',
          criteria: { perfectScore: true },
          progress: { correctAnswers, totalQuestions },
        });
      }

      if (newAchievements.length > 0) {
        await db.insert(achievements).values(newAchievements);
        await db.update(users)
          .set({ points: points })
          .where(eq(users.id, req.user.id));
      }

      res.json(newAchievements);
    } catch (error) {
      res.status(500).send("Failed to check achievements");
    }
  });


  app.get("/api/learning-paths", async (req, res) => {
    try {
      const paths = await db.select().from(learningPaths);
      res.json(paths);
    } catch (error) {
      res.status(500).send("Failed to fetch learning paths");
    }
  });

  app.get("/api/learning-paths/user", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const userPaths = await db
        .select()
        .from(userLearningPaths)
        .where(eq(userLearningPaths.userId, req.user.id));

      res.json(userPaths);
    } catch (error) {
      res.status(500).send("Failed to fetch user learning paths");
    }
  });

  app.post("/api/learning-paths/enroll", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    const { pathId } = req.body;
    try {
      const [path] = await db
        .select()
        .from(learningPaths)
        .where(eq(learningPaths.id, pathId));

      if (!path) {
        return res.status(404).send("Learning path not found");
      }

      const [existingEnrollment] = await db
        .select()
        .from(userLearningPaths)
        .where(and(
          eq(userLearningPaths.userId, req.user.id),
          eq(userLearningPaths.pathId, pathId)
        ));

      if (existingEnrollment) {
        return res.status(400).send("Already enrolled in this learning path");
      }

      const topics = path.topics as string[];
      const progress = Object.fromEntries(topics.map(topic => [topic, false]));

      const [enrollment] = await db
        .insert(userLearningPaths)
        .values({
          userId: req.user.id,
          pathId,
          progress,
        })
        .returning();

      res.json(enrollment);
    } catch (error) {
      res.status(500).send("Failed to enroll in learning path");
    }
  });

  app.get("/api/forum/posts", async (req, res) => {
    try {
      const posts = await db
        .select()
        .from(forumPosts)
        .orderBy(desc(forumPosts.pinned), desc(forumPosts.createdAt));

      const postsWithReactions = await Promise.all(posts.map(async (post) => {
        const reactions = await db
          .select({
            type: forumReactions.type,
            count: count(),
          })
          .from(forumReactions)
          .where(eq(forumReactions.postId, post.id))
          .groupBy(forumReactions.type);

        const comments = await db
          .select()
          .from(forumComments)
          .where(eq(forumComments.postId, post.id));

        return {
          ...post,
          reactions: Object.fromEntries(
            reactions.map(r => [r.type, Number(r.count)])
          ),
          comments,
        };
      }));

      res.json(postsWithReactions);
    } catch (error) {
      res.status(500).send("Failed to fetch forum posts");
    }
  });

  app.post("/api/forum/posts", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const [post] = await db
        .insert(forumPosts)
        .values({
          ...req.body,
          authorId: req.user.id,
        })
        .returning();

      res.json(post);
    } catch (error) {
      res.status(500).send("Failed to create forum post");
    }
  });

  app.get("/api/forum/posts/:postId/comments", async (req, res) => {
    const postId = parseInt(req.params.postId);

    try {
      const comments = await db
        .select()
        .from(forumComments)
        .where(eq(forumComments.postId, postId))
        .orderBy(desc(forumComments.createdAt));

      const commentsWithReactions = await Promise.all(comments.map(async (comment) => {
        const reactions = await db
          .select({
            type: forumReactions.type,
            count: count(),
          })
          .from(forumReactions)
          .where(eq(forumReactions.commentId, comment.id))
          .groupBy(forumReactions.type);

        return {
          ...comment,
          reactions: Object.fromEntries(
            reactions.map(r => [r.type, Number(r.count)])
          ),
        };
      }));

      res.json(commentsWithReactions);
    } catch (error) {
      res.status(500).send("Failed to fetch comments");
    }
  });

  app.post("/api/forum/comments", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const [comment] = await db
        .insert(forumComments)
        .values({
          ...req.body,
          authorId: req.user.id,
        })
        .returning();

      res.json(comment);
    } catch (error) {
      res.status(500).send("Failed to create comment");
    }
  });

  app.post("/api/forum/reactions", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    const { type, postId, commentId } = req.body;

    try {
      const [existingReaction] = await db
        .select()
        .from(forumReactions)
        .where(
          and(
            eq(forumReactions.userId, req.user.id),
            postId ? eq(forumReactions.postId, postId) : eq(forumReactions.commentId, commentId),
            eq(forumReactions.type, type)
          )
        );

      if (existingReaction) {
        await db
          .delete(forumReactions)
          .where(eq(forumReactions.id, existingReaction.id));
        return res.json({ removed: true });
      }

      const [reaction] = await db
        .insert(forumReactions)
        .values({
          type,
          postId,
          commentId,
          userId: req.user.id,
        })
        .returning();

      res.json(reaction);
    } catch (error) {
      res.status(500).send("Failed to add reaction");
    }
  });

  app.get("/api/contributors/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);

    try {
      const [contributor] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!contributor) {
        return res.status(404).send("Contributor not found");
      }

      const contributorBadges = await db
        .select({
          badge: badges,
          category: badgeCategories,
        })
        .from(userBadges)
        .where(eq(userBadges.userId, userId))
        .innerJoin(badges, eq(userBadges.badgeId, badges.id))
        .innerJoin(badgeCategories, eq(badges.categoryId, badgeCategories.id));

      const [stats] = await db
        .select({
          totalQuestions: count(),
          approvedQuestions: count(questions.approved),
        })
        .from(questions)
        .where(eq(questions.createdBy, userId));

      res.json({
        contributor: {
          id: contributor.id,
          username: contributor.username,
          points: contributor.points,
          joinedAt: contributor.createdAt,
        },
        badges: contributorBadges,
        stats: {
          totalQuestions: Number(stats?.totalQuestions || 0),
          approvedQuestions: Number(stats?.approvedQuestions || 0),
        },
      });
    } catch (error) {
      console.error("Error fetching contributor info:", error);
      res.status(500).send("Failed to fetch contributor information");
    }
  });

  app.get("/api/news", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const news = await getPersonalizedNews(req.user.id);
      res.json(news);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).send("Failed to fetch news");
    }
  });

  app.get("/api/micro-learning", async (req, res) => {
    try {
      const content = await generateMicroLearning();
      res.json(content);
    } catch (error) {
      console.error('Micro-learning endpoint error:', error);
      res.status(500).send("Failed to generate micro-learning content");
    }
  });

  // Knowledge Base Routes
  app.get("/api/knowledge", async (req, res) => {
    try {
      const entries = await db
        .select()
        .from(knowledgeEntries)
        .orderBy(desc(knowledgeEntries.score));

      const entriesWithMeta = await Promise.all(entries.map(async (entry) => {
        const votes = await db
          .select({
            upvotes: count(knowledgeVotes.id),
          })
          .from(knowledgeVotes)
          .where(and(
            eq(knowledgeVotes.entryId, entry.id),
            eq(knowledgeVotes.value, 1)
          ));

        const revisions = await db
          .select({
            count: count(),
          })
          .from(knowledgeRevisions)
          .where(eq(knowledgeRevisions.entryId, entry.id));

        return {
          ...entry,
          upvotes: Number(votes[0]?.upvotes || 0),
          revisionCount: Number(revisions[0]?.count || 0),
        };
      }));

      res.json(entriesWithMeta);
    } catch (error) {
      console.error("Error fetching knowledge entries:", error);
      res.status(500).send("Failed to fetch knowledge entries");
    }
  });

  app.post("/api/knowledge", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const [entry] = await db
        .insert(knowledgeEntries)
        .values({
          ...req.body,
          authorId: req.user.id,
        })
        .returning();

      res.json(entry);
    } catch (error) {
      console.error("Error creating knowledge entry:", error);
      res.status(500).send("Failed to create knowledge entry");
    }
  });

  app.get("/api/knowledge/:id", async (req, res) => {
    const entryId = parseInt(req.params.id);

    try {
      const [entry] = await db
        .select()
        .from(knowledgeEntries)
        .where(eq(knowledgeEntries.id, entryId));

      if (!entry) {
        return res.status(404).send("Knowledge entry not found");
      }

      await db
        .update(knowledgeEntries)
        .set({ viewCount: entry.viewCount + 1 })
        .where(eq(knowledgeEntries.id, entryId));

      const votes = await db
        .select({
          upvotes: count(knowledgeVotes.id),
          expertVotes: count(users.role),
        })
        .from(knowledgeVotes)
        .leftJoin(users, eq(knowledgeVotes.userId, users.id))
        .where(and(
          eq(knowledgeVotes.entryId, entryId),
          eq(knowledgeVotes.value, 1),
          eq(users.role, 'admin')
        ));

      const revisions = await db
        .select()
        .from(knowledgeRevisions)
        .where(eq(knowledgeRevisions.entryId, entryId))
        .orderBy(desc(knowledgeRevisions.createdAt));

      res.json({
        ...entry,
        upvotes: Number(votes[0]?.upvotes || 0),
        expertVotes: Number(votes[0]?.expertVotes || 0),
        revisions,
      });
    } catch (error) {
      console.error("Error fetching knowledge entry:", error);
      res.status(500).send("Failed to fetch knowledge entry");
    }
  });

  app.post("/api/knowledge/:id/vote", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    const entryId = parseInt(req.params.id);
    const { value, expertise, comment } = req.body;

    try {
      const [existingVote] = await db
        .select()
        .from(knowledgeVotes)
        .where(and(
          eq(knowledgeVotes.entryId, entryId),
          eq(knowledgeVotes.userId, req.user.id)
        ));

      if (existingVote) {
        const [updatedVote] = await db
          .update(knowledgeVotes)
          .set({ value, expertise, comment })
          .where(eq(knowledgeVotes.id, existingVote.id))
          .returning();

        return res.json(updatedVote);
      }

      const [vote] = await db
        .insert(knowledgeVotes)
        .values({
          entryId,
          userId: req.user.id,
          value,
          expertise,
          comment,
        })
        .returning();

      await db
        .update(knowledgeEntries)
        .set({ score: value })
        .where(eq(knowledgeEntries.id, entryId));

      res.json(vote);
    } catch (error) {
      console.error("Error voting on knowledge entry:", error);
      res.status(500).send("Failed to vote on knowledge entry");
    }
  });

  app.get("/api/knowledge/:id/revisions", async (req, res) => {
    const entryId = parseInt(req.params.id);

    try {
      const revisions = await db
        .select()
        .from(knowledgeRevisions)
        .where(eq(knowledgeRevisions.entryId, entryId))
        .orderBy(desc(knowledgeRevisions.createdAt));

      res.json(revisions);
    } catch (error) {
      console.error("Error fetching revisions:", error);
      res.status(500).send("Failed to fetch revisions");
    }
  });

  // Add this after the existing /api/knowledge route
  app.post("/api/knowledge/sample", async (req, res) => {
    try {
      const [entry] = await db
        .insert(knowledgeEntries)
        .values({
          title: "AI Applications Revolutionizing Water Sector Management",
          content: `Artificial Intelligence (AI) is transforming the water sector through innovative applications that enhance efficiency, sustainability, and decision-making. Here are key areas where AI is making a significant impact:

1. Smart Water Quality Monitoring
- Real-time water quality analysis using machine learning algorithms
- Predictive contamination detection systems
- Automated water testing and reporting

2. Infrastructure Management
- Leak detection and prevention using AI pattern recognition
- Predictive maintenance for water infrastructure
- Asset lifecycle optimization

3. Demand Forecasting
- Machine learning models for water consumption prediction
- Dynamic pricing optimization
- Resource allocation improvement

4. Treatment Process Optimization
- Automated dosing control systems
- Energy efficiency optimization
- Process performance prediction

5. Climate Change Adaptation
- AI-powered climate impact assessment
- Flood prediction and management
- Drought resilience planning

This technology integration is helping water utilities and organizations achieve better operational efficiency, reduce costs, and improve service delivery while promoting environmental sustainability.`,
          category: "water_treatment",
          tags: ["artificial_intelligence", "machine_learning", "water_management", "smart_water", "sustainability"],
          authorId: 1, // Using the test user ID
          score: 0,
          viewCount: 0,
          expertVerified: true,
          mediaType: "text",
        })
        .returning();

      res.json(entry);
    } catch (error) {
      console.error("Error creating sample knowledge entry:", error);
      res.status(500).send("Failed to create sample knowledge entry");
    }
  });

  // Credentials management endpoints
  app.get("/api/user/credentials", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const credentials = await db
        .select()
        .from(userCredentials)
        .where(eq(userCredentials.userId, req.user.id))
        .orderBy(desc(userCredentials.createdAt));

      res.json(credentials);
    } catch (error) {
      console.error("Error fetching credentials:", error);
      res.status(500).send("Failed to fetch credentials");
    }
  });

  app.post("/api/user/credentials", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const [credential] = await db
        .insert(userCredentials)
        .values({
          ...req.body,
          userId: req.user.id,
        })
        .returning();

      res.json(credential);
    } catch (error) {
      console.error("Error adding credential:", error);
      res.status(500).send("Failed to add credential");
    }
  });

  app.get("/api/user/publications", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const publications = await db
        .select()
        .from(userPublications)
        .where(eq(userPublications.userId, req.user.id))
        .orderBy(desc(userPublications.publicationDate));

      res.json(publications);
    } catch (error) {
      console.error("Error fetching publications:", error);
      res.status(500).send("Failed to fetch publications");
    }
  });

  app.post("/api/user/publications", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const [publication] = await db
        .insert(userPublications)
        .values({
          ...req.body,
          userId: req.user.id,
        })
        .returning();

      res.json(publication);
    } catch (error) {
      console.error("Error adding publication:", error);
      res.status(500).send("Failed to add publication");
    }
  });

  // Add skill management endpoints at the end of the file, before return httpServer
  app.post("/api/user/skills", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const [skill] = await db
        .insert(userSkills)
        .values({
          ...req.body,
          userId: req.user.id,
        })
        .returning();

      res.json(skill);
    } catch (error) {
      console.error("Error adding skill:", error);
      res.status(500).send("Failed to add skill");
    }
  });

  app.get("/api/user/skills/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);

    try {
      const skills = await db
        .select()
        .from(userSkills)
        .where(eq(userSkills.userId, userId))
        .orderBy(desc(userSkills.endorsementCount));

      const skillsWithEndorsements = await Promise.all(
        skills.map(async (skill) => {
          const endorsements = await db
            .select()
            .from(skillEndorsements)
            .where(eq(skillEndorsements.skillId, skill.id))
            .limit(3);

          return {
            ...skill,
            endorsements,
          };
        })
      );

      res.json(skillsWithEndorsements);
    } catch (error) {
      console.error("Error fetching skills:", error);
      res.status(500).send("Failed to fetch skills");
    }
  });

  app.post("/api/user/skills/endorse", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    const { skillId, expertise, comment, endorsedUserId } = req.body;

    try {
      // Check if user is trying to endorse their own skill
      if (endorsedUserId === req.user.id) {
        return res.status(400).send("Cannot endorse your own skill");
      }

      // Check if already endorsed
      const [existingEndorsement] = await db
        .select()
        .from(skillEndorsements)
        .where(
          and(
            eq(skillEndorsements.skillId, skillId),
            eq(skillEndorsements.endorserId, req.user.id)
          )
        );

      if (existingEndorsement) {
        return res.status(400).send("Already endorsed this skill");
      }

      const [endorsement] = await db
        .insert(skillEndorsements)
        .values({
          skillId,
          endorserId: req.user.id,
          endorsedUserId,
          expertise,
          comment,
        })
        .returning();

      // Update endorsement count
      await db
        .update(userSkills)
        .set({
          endorsementCount: sql`${userSkills.endorsementCount} + 1`
        })
        .where(eq(userSkills.id, skillId));

      res.json(endorsement);
    } catch (error) {
      console.error("Error adding endorsement:", error);
      res.status(500).send("Failed to add endorsement");
    }
  });

  // Community networking routes
  app.get("/api/professionals", async (req, res) => {
    try {
      const { search } = req.query;
      let query = db.select().from(users);

      if (search) {
        query = query.where(sql`
          full_name ILIKE ${`%${search}%`} OR
          company ILIKE ${`%${search}%`} OR
          specializations::text ILIKE ${`%${search}%`}
        `);
      }

      const professionals = await query.orderBy(desc(users.lastActiveAt));

      // Remove sensitive information
      const sanitizedProfessionals = professionals.map(({ password, ...user }) => ({
        ...user,
        specializations: user.specializations || [],
      }));

      res.json(sanitizedProfessionals);
    } catch (error) {
      console.error("Error fetching professionals:", error);
      res.status(500).send("Failed to fetch professionals");
    }
  });

  app.get("/api/professional-groups", async (req, res) => {
    try {
      const groups = await db
        .select()
        .from(professionalGroups)
        .orderBy(desc(professionalGroups.memberCount));

      res.json(groups);
    } catch (error) {
      console.error("Error fetching professional groups:", error);
      res.status(500).send("Failed to fetch professional groups");
    }
  });

  app.post("/api/professional-connections", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const { receiverId, message } = req.body;

      // Check if connection already exists
      const [existingConnection] = await db
        .select()
        .from(professionalConnections)
        .where(
          and(
            eq(professionalConnections.requesterId, req.user.id),
            eq(professionalConnections.receiverId, receiverId)
          )
        );

      if (existingConnection) {
        return res.status(400).send("Connection request already exists");
      }

      const [connection] = await db
        .insert(professionalConnections)
        .values({
          requesterId: req.user.id,
          receiverId,
          message,
        })
        .returning();

      res.json(connection);
    } catch (error) {
      console.error("Error creating connection:", error);
      res.status(500).send("Failed to create connection");
    }
  });

  app.post("/api/professional-groups", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const [group] = await db
        .insert(professionalGroups)
        .values({
          ...req.body,
          createdById: req.user.id,
        })
        .returning();

      // Add creator as admin member
      await db.insert(groupMemberships).values({
        groupId: group.id,
        userId: req.user.id,
        role: 'admin',
      });

      res.json(group);
    } catch (error) {
      console.error("Error creating group:", error);
      res.status(500).send("Failed to create group");
    }
  });

  app.post("/api/group-memberships", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const { groupId } = req.body;

      // Check if already a member
      const [existingMembership] = await db
        .select()
        .from(groupMemberships)
        .where(
          and(
            eq(groupMemberships.groupId, groupId),
            eq(groupMemberships.userId, req.user.id)
          )
        );

      if (existingMembership) {
        return res.status(400).send("Already a member of this group");
      }

      const [membership] = await db
        .insert(groupMemberships)
        .values({
          groupId,
          userId: req.user.id,
        })
        .returning();

      // Update member count
      await db
        .update(professionalGroups)
        .set({ memberCount: sql`member_count + 1` })
        .where(eq(professionalGroups.id, groupId));

      res.json(membership);
    } catch (error) {
      console.error("Error joining group:", error);
      res.status(500).send("Failed to join group");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

interface PerformanceMetrics {
  correctAnswers: number;
  totalQuestions: number;
  streakCount: number;
  categoryAccuracy: Record<string, number>;
}

function calculateRecommendedDifficulty(
  currentDifficulty: DifficultyLevel,
  accuracy: number,
  streak: number
): DifficultyLevel {
  if (accuracy >= 80 && streak >= 3) {
    return currentDifficulty === 'beginner' ? 'intermediate' :
           currentDifficulty === 'intermediate' ? 'expert' : 'expert';
  } else if (accuracy <= 40) {
    return currentDifficulty === 'expert' ? 'intermediate' :
           currentDifficulty === 'intermediate' ? 'beginner' : 'beginner';
  }
  return currentDifficulty;
}

async function getPersonalizedNews(userId: number): Promise<any> {
  return [{ title: "News item 1", content: "News content 1" }, { title: "News item 2", content: "News content 2" }];
}

type DifficultyLevel = 'beginner' | 'intermediate' | 'expert';