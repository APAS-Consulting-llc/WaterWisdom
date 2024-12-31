import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { questions, userProgress, achievements, users } from "@db/schema";
import { eq, and, count } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Get questions
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

  // Submit answer
  app.post("/api/submit-answer", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    const { questionId, answer } = req.body;
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

      // Return both the progress and the question explanation
      res.json({
        ...progress,
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