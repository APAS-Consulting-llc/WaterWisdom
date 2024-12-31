import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { questions, userProgress, achievements, users, learningPaths, userLearningPaths, forumPosts, forumComments, forumReactions, badges, userBadges, badgeCategories } from "@db/schema";
import { eq, and, count, avg, desc } from "drizzle-orm";
import { startDailyQuizScheduler } from './services/schedulerService';
import { handleChatMessage } from './services/chatService';
import { generateMicroLearning } from './services/microLearningService';

type DifficultyLevel = 'beginner' | 'intermediate' | 'expert';

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

// Placeholder for getPersonalizedNews function.  Implementation details are needed.
async function getPersonalizedNews(userId: number): Promise<any> {
  // Replace this with actual news fetching logic
  return [{ title: "News item 1", content: "News content 1" }, { title: "News item 2", content: "News content 2" }];
}


export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Start the daily quiz scheduler
  startDailyQuizScheduler();

  // Add chat endpoint
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

  // SMS Preferences Management
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

  // Get questions with adaptive difficulty
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

  // Submit answer with performance tracking
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

      // Record progress
      const [progress] = await db
        .insert(userProgress)
        .values({
          userId: req.user.id,
          questionId,
          correct,
        })
        .returning();

      // Calculate performance metrics
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

      // Calculate category accuracy
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

      // Calculate recommended difficulty
      const accuracy = (performanceMetrics.correctAnswers / performanceMetrics.totalQuestions) * 100;
      const recommendedDifficulty = calculateRecommendedDifficulty(
        difficulty as DifficultyLevel,
        accuracy,
        performanceMetrics.streakCount
      );

      // Update user streak and points
      await db
        .update(users)
        .set({
          streak: correct ? currentStreak + 1 : 0,
          points: req.user.points + (correct ? 10 : 0)
        })
        .where(eq(users.id, req.user.id));

      // Return progress with performance metrics and recommended difficulty
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

  // Create question (admin only)
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

  // Get user progress
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

  // Get user achievements
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

  // Check and award achievements
  app.post("/api/achievements/check", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const { points, streak, category, correctAnswers, totalQuestions } = req.body;
      const newAchievements: typeof achievements.$inferInsert[] = [];

      // Check for streak achievements
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

      // Check for points achievements
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

      // Check for category mastery
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

      // Check for perfect score
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

      // Insert new achievements and update user points
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


  // Get all learning paths
  app.get("/api/learning-paths", async (req, res) => {
    try {
      const paths = await db.select().from(learningPaths);
      res.json(paths);
    } catch (error) {
      res.status(500).send("Failed to fetch learning paths");
    }
  });

  // Get user's learning paths
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

  // Enroll in a learning path
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

      // Check if already enrolled
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

      // Create progress object with all topics marked as incomplete
      const topics = path.topics as string[];
      const progress = Object.fromEntries(topics.map(topic => [topic, false]));

      // Enroll user
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

  // Forum Routes
  // Get all forum posts
  app.get("/api/forum/posts", async (req, res) => {
    try {
      const posts = await db
        .select()
        .from(forumPosts)
        .orderBy(desc(forumPosts.pinned), desc(forumPosts.createdAt));

      // Get reactions count for each post
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

  // Create forum post
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

  // Get comments for a post
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

  // Create comment
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

  // Add reaction
  app.post("/api/forum/reactions", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    const { type, postId, commentId } = req.body;

    try {
      // Check if user already reacted
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
        // Remove reaction if it exists
        await db
          .delete(forumReactions)
          .where(eq(forumReactions.id, existingReaction.id));
        return res.json({ removed: true });
      }

      // Add new reaction
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

  // Add this new endpoint
  app.get("/api/contributors/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);

    try {
      // Get contributor's basic info
      const [contributor] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!contributor) {
        return res.status(404).send("Contributor not found");
      }

      // Get contributor's badges with category information
      const contributorBadges = await db
        .select({
          badge: badges,
          category: badgeCategories,
        })
        .from(userBadges)
        .where(eq(userBadges.userId, userId))
        .innerJoin(badges, eq(userBadges.badgeId, badges.id))
        .innerJoin(badgeCategories, eq(badges.categoryId, badgeCategories.id));

      // Get contribution statistics
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

  // Add this new endpoint
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

  // Add micro-learning endpoint
  app.get("/api/micro-learning", async (req, res) => {
    try {
      const content = await generateMicroLearning();
      res.json(content);
    } catch (error) {
      console.error('Micro-learning endpoint error:', error);
      res.status(500).send("Failed to generate micro-learning content");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}