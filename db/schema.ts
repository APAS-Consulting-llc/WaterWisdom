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
  createdAt: timestamp("created_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  type: text("type", { enum: ['multiple_choice', 'true_false', 'short_answer'] }).notNull(),
  difficulty: text("difficulty", { enum: ['beginner', 'intermediate', 'expert'] }).notNull(),
  category: text("category").notNull(),
  question: text("question").notNull(),
  options: jsonb("options"),
  correctAnswer: text("correct_answer").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  approved: boolean("approved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  questionId: integer("question_id").references(() => questions.id),
  correct: boolean("correct").notNull(),
  answeredAt: timestamp("answered_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type", { enum: ['streak', 'points', 'category_mastery'] }).notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

export const userRelations = relations(users, ({ many }) => ({
  questions: many(questions),
  progress: many(userProgress),
  achievements: many(achievements),
}));

export const questionRelations = relations(questions, ({ one, many }) => ({
  creator: one(users, {
    fields: [questions.createdBy],
    references: [users.id],
  }),
  progress: many(userProgress),
}));

// Type definitions with proper enums
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'expert';
export type UserRole = 'user' | 'admin';
export type AchievementType = 'streak' | 'points' | 'category_mastery';

// Base types from database schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type UserProgress = typeof userProgress.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertQuestionSchema = createInsertSchema(questions, {
  type: z.enum(['multiple_choice', 'true_false', 'short_answer']),
  difficulty: z.enum(['beginner', 'intermediate', 'expert']),
});
export const selectQuestionSchema = createSelectSchema(questions);