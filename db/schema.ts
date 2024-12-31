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
  preferredQuizTime: text("preferred_quiz_time").default('10:00'),
  timezone: text("timezone").default('UTC'),
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

export const badgeCategories = pgTable("badge_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // Lucide icon name
  color: text("color").notNull(), // Tailwind color class
  createdAt: timestamp("created_at").defaultNow(),
});

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => badgeCategories.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // Lucide icon name
  color: text("color").notNull(), // Tailwind color class
  criteria: jsonb("criteria").notNull(), // e.g., { "questionCount": 10, "category": "water_treatment" }
  createdAt: timestamp("created_at").defaultNow(),
});

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  badgeId: integer("badge_id").references(() => badges.id),
  awardedAt: timestamp("awarded_at").defaultNow(),
});

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

export const knowledgeEntries = pgTable("knowledge_entries", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  tags: jsonb("tags").default([]),
  authorId: integer("author_id").references(() => users.id),
  expertVerified: boolean("expert_verified").default(false),
  score: integer("score").default(0),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const knowledgeVotes = pgTable("knowledge_votes", {
  id: serial("id").primaryKey(),
  entryId: integer("entry_id").references(() => knowledgeEntries.id),
  userId: integer("user_id").references(() => users.id),
  value: integer("value").notNull(), // 1 for upvote, -1 for downvote
  expertise: text("expertise").notNull(), // area of expertise for the vote
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const knowledgeRevisions = pgTable("knowledge_revisions", {
  id: serial("id").primaryKey(),
  entryId: integer("entry_id").references(() => knowledgeEntries.id),
  authorId: integer("author_id").references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  tags: jsonb("tags").default([]),
  revisionNote: text("revision_note"),
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
  badges: many(userBadges),
  knowledgeEntries: many(knowledgeEntries),
  knowledgeVotes: many(knowledgeVotes),
  knowledgeRevisions: many(knowledgeRevisions),
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

export const badgeCategoryRelations = relations(badgeCategories, ({ many }) => ({
  badges: many(badges),
}));

export const badgeRelations = relations(badges, ({ one, many }) => ({
  category: one(badgeCategories, {
    fields: [badges.categoryId],
    references: [badgeCategories.id],
  }),
  userBadges: many(userBadges),
}));

export const userBadgeRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

export const knowledgeEntryRelations = relations(knowledgeEntries, ({ one, many }) => ({
  author: one(users, {
    fields: [knowledgeEntries.authorId],
    references: [users.id],
  }),
  votes: many(knowledgeVotes),
  revisions: many(knowledgeRevisions),
}));

export const knowledgeVoteRelations = relations(knowledgeVotes, ({ one }) => ({
  entry: one(knowledgeEntries, {
    fields: [knowledgeVotes.entryId],
    references: [knowledgeEntries.id],
  }),
  user: one(users, {
    fields: [knowledgeVotes.userId],
    references: [users.id],
  }),
}));

export const knowledgeRevisionRelations = relations(knowledgeRevisions, ({ one }) => ({
  entry: one(knowledgeEntries, {
    fields: [knowledgeRevisions.entryId],
    references: [knowledgeEntries.id],
  }),
  author: one(users, {
    fields: [knowledgeRevisions.authorId],
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
export type ForumPost = typeof forumPosts.$inferSelect;
export type NewForumPost = typeof forumPosts.$inferInsert;
export type ForumComment = typeof forumComments.$inferSelect;
export type NewForumComment = typeof forumComments.$inferInsert;
export type ForumReaction = typeof forumReactions.$inferSelect;
export type NewForumReaction = typeof forumReactions.$inferInsert;
export type BadgeCategory = typeof badgeCategories.$inferSelect;
export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type KnowledgeEntry = typeof knowledgeEntries.$inferSelect;
export type NewKnowledgeEntry = typeof knowledgeEntries.$inferInsert;
export type KnowledgeVote = typeof knowledgeVotes.$inferSelect;
export type NewKnowledgeVote = typeof knowledgeVotes.$inferInsert;
export type KnowledgeRevision = typeof knowledgeRevisions.$inferSelect;
export type NewKnowledgeRevision = typeof knowledgeRevisions.$inferInsert;

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
export const insertBadgeCategorySchema = createInsertSchema(badgeCategories);
export const selectBadgeCategorySchema = createSelectSchema(badgeCategories);
export const insertBadgeSchema = createInsertSchema(badges);
export const selectBadgeSchema = createSelectSchema(badges);
export const insertUserBadgeSchema = createInsertSchema(userBadges);
export const selectUserBadgeSchema = createSelectSchema(userBadges);
export const insertKnowledgeEntrySchema = createInsertSchema(knowledgeEntries);
export const selectKnowledgeEntrySchema = createSelectSchema(knowledgeEntries);
export const insertKnowledgeVoteSchema = createInsertSchema(knowledgeVotes);
export const selectKnowledgeVoteSchema = createSelectSchema(knowledgeVotes);
export const insertKnowledgeRevisionSchema = createInsertSchema(knowledgeRevisions);
export const selectKnowledgeRevisionSchema = createSelectSchema(knowledgeRevisions);