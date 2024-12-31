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
  phoneNumber: text("phone_number"),
  smsNotificationsEnabled: boolean("sms_notifications_enabled").default(false),
  lastNotificationSent: timestamp("last_notification_sent"),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  type: text("type", { enum: ['multiple_choice', 'true_false', 'short_answer'] }).notNull(),
  difficulty: text("difficulty", { enum: ['beginner', 'intermediate', 'expert'] }).notNull(),
  category: text("category").notNull(),
  topic: text("topic").notNull().default('general'),
  question: text("question").notNull(),
  options: jsonb("options"),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation").notNull(),
  references: text("references").default(''),
  createdBy: integer("created_by").references(() => users.id),
  approved: boolean("approved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  questionId: integer("question_id").references(() => questions.id),
  correct: boolean("correct").notNull(),
  timeSpent: integer("time_spent").default(0),
  answeredAt: timestamp("answered_at").defaultNow(),
});

export const learningPaths = pgTable("learning_paths", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  topics: jsonb("topics").notNull(),
  difficulty: text("difficulty", { enum: ['beginner', 'intermediate', 'expert'] }).notNull(),
  prerequisites: jsonb("prerequisites").default([]),
  estimatedHours: integer("estimated_hours").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userLearningPaths = pgTable("user_learning_paths", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  pathId: integer("path_id").references(() => learningPaths.id),
  progress: jsonb("progress").notNull().default({}),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type", { enum: ['streak', 'points', 'category_mastery', 'quiz_completion', 'perfect_score', 'path_completion'] }).notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  criteria: jsonb("criteria").default({}),
  progress: jsonb("progress").default({}),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

// New forum-related tables
export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").references(() => users.id),
  questionId: integer("question_id").references(() => questions.id),
  tags: jsonb("tags").default([]),
  views: integer("views").notNull().default(0),
  pinned: boolean("pinned").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const forumComments = pgTable("forum_comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  authorId: integer("author_id").references(() => users.id),
  postId: integer("post_id").references(() => forumPosts.id),
  parentId: integer("parent_id").references(() => forumComments.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const forumReactions = pgTable("forum_reactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  postId: integer("post_id").references(() => forumPosts.id),
  commentId: integer("comment_id").references(() => forumComments.id),
  type: text("type", { enum: ['like', 'helpful', 'insightful'] }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  questions: many(questions),
  progress: many(userProgress),
  achievements: many(achievements),
  learningPaths: many(userLearningPaths),
  forumPosts: many(forumPosts),
  forumComments: many(forumComments),
  forumReactions: many(forumReactions),
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

export const forumPostRelations = relations(forumPosts, ({ one, many }) => ({
  author: one(users, {
    fields: [forumPosts.authorId],
    references: [users.id],
  }),
  question: one(questions, {
    fields: [forumPosts.questionId],
    references: [questions.id],
  }),
  comments: many(forumComments),
  reactions: many(forumReactions),
}));

export const forumCommentRelations = relations(forumComments, ({ one, many }) => ({
  author: one(users, {
    fields: [forumComments.authorId],
    references: [users.id],
  }),
  post: one(forumPosts, {
    fields: [forumComments.postId],
    references: [forumPosts.id],
  }),
  parent: one(forumComments, {
    fields: [forumComments.parentId],
    references: [forumComments.id],
  }),
  reactions: many(forumReactions),
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
export type ForumPost = typeof forumPosts.$inferSelect;
export type NewForumPost = typeof forumPosts.$inferInsert;
export type ForumComment = typeof forumComments.$inferSelect;
export type NewForumComment = typeof forumComments.$inferInsert;
export type ForumReaction = typeof forumReactions.$inferSelect;
export type NewForumReaction = typeof forumReactions.$inferInsert;

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
export const insertForumPostSchema = createInsertSchema(forumPosts);
export const selectForumPostSchema = createSelectSchema(forumPosts);
export const insertForumCommentSchema = createInsertSchema(forumComments);
export const selectForumCommentSchema = createSelectSchema(forumComments);
export const insertForumReactionSchema = createInsertSchema(forumReactions);
export const selectForumReactionSchema = createSelectSchema(forumReactions);