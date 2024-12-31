import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { questions, userProgress, achievements, users } from "@db/schema";
import { eq, and, count, avg } from "drizzle-orm";

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

export function registerRoutes(app: Express): Server {
  setupAuth(app);

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

  const httpServer = createServer(app);
  return httpServer;
}