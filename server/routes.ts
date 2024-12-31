import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import CollaborationService from "./services/collaborationService";
import { handleChatMessage } from './services/chatService';

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Create HTTP server
  const httpServer = createServer(app);

  // Initialize WebSocket collaboration service
  new CollaborationService(httpServer);

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

import { questions, userProgress, achievements, learningPaths, userLearningPaths, forumPosts, forumComments, forumReactions, badges, userBadges, badgeCategories, knowledgeEntries, knowledgeVotes, knowledgeRevisions } from "@db/schema";
import { and, count, avg, desc } from "drizzle-orm";
import { startDailyQuizScheduler } from './services/schedulerService';
import { generateMicroLearning } from './services/microLearningService';