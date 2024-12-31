import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from 'zod';

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  role: text("role", { enum: ['user', 'admin'] }).notNull().default('user'),
  points: integer("points").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  type: text("type", { enum: ['multiple_choice', 'true_false', 'short_answer'] }).notNull(),
  difficulty: text("difficulty", { enum: ['beginner', 'intermediate', 'expert'] }).notNull(),
  category: text("category").notNull(),
  topic: text("topic").notNull().default('general'), // Added default to prevent data loss
  question: text("question").notNull(),
  options: jsonb("options"),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation").notNull(),
  references: text("references").default(''), // Added default
  createdBy: integer("created_by").references(() => users.id),
  approved: boolean("approved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  questionId: integer("question_id").references(() => questions.id),
  correct: boolean("correct").notNull(),
  timeSpent: integer("time_spent").default(0), // Added default
  answeredAt: timestamp("answered_at").defaultNow(),
});

export const learningPaths = pgTable("learning_paths", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  topics: jsonb("topics").notNull(),
  difficulty: text("difficulty", { enum: ['beginner', 'intermediate', 'expert'] }).notNull(),
  prerequisites: jsonb("prerequisites").default([]), // Added default
  estimatedHours: integer("estimated_hours").default(1), // Added default
  createdAt: timestamp("created_at").defaultNow(),
});

export const userLearningPaths = pgTable("user_learning_paths", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  pathId: integer("path_id").references(() => learningPaths.id),
  progress: jsonb("progress").notNull().default({}), // Added default
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type", { enum: ['streak', 'points', 'category_mastery', 'quiz_completion', 'perfect_score', 'path_completion'] }).notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  criteria: jsonb("criteria").default({}), // Added default
  progress: jsonb("progress").default({}), // Added default
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  questions: many(questions),
  progress: many(userProgress),
  achievements: many(achievements),
  learningPaths: many(userLearningPaths),
}));

export const questionRelations = relations(questions, ({ one, many }) => ({
  creator: one(users, {
    fields: [questions.createdBy],
    references: [users.id],
  }),
  progress: many(userProgress),
}));

export const learningPathRelations = relations(learningPaths, ({ many }) => ({
  users: many(userLearningPaths),
}));

export const userLearningPathRelations = relations(userLearningPaths, ({ one }) => ({
  user: one(users, {
    fields: [userLearningPaths.userId],
    references: [users.id],
  }),
  path: one(learningPaths, {
    fields: [userLearningPaths.pathId],
    references: [learningPaths.id],
  }),
}));

export const achievementRelations = relations(achievements, ({ one }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.id],
  }),
}));

// Types
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'expert';
export type UserRole = 'user' | 'admin';
export type AchievementType = 'streak' | 'points' | 'category_mastery' | 'quiz_completion' | 'perfect_score' | 'path_completion';

// Base types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type UserProgress = typeof userProgress.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type LearningPath = typeof learningPaths.$inferSelect;
export type UserLearningPath = typeof userLearningPaths.$inferSelect;

// Schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertQuestionSchema = createInsertSchema(questions, {
  type: z.enum(['multiple_choice', 'true_false', 'short_answer']),
  difficulty: z.enum(['beginner', 'intermediate', 'expert']),
});
export const selectQuestionSchema = createSelectSchema(questions);
export const insertLearningPathSchema = createInsertSchema(learningPaths, {
  difficulty: z.enum(['beginner', 'intermediate', 'expert']),
});
export const selectLearningPathSchema = createSelectSchema(learningPaths);