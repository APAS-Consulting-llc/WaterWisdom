import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from 'zod';

// Existing users table with additional professional networking fields
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  role: text("role", { enum: ['user', 'admin'] }).notNull().default('user'),
  // Professional profile fields
  fullName: text("full_name"),
  title: text("job_title"),
  company: text("company"),
  bio: text("bio"),
  location: text("location"),
  yearsOfExperience: integer("years_of_experience"),
  specializations: jsonb("specializations").default([]),
  website: text("website"),
  linkedin: text("linkedin_url"),
  twitter: text("twitter_url"),
  profileVisibility: text("profile_visibility", { 
    enum: ['public', 'connections', 'private'] 
  }).default('public'),
  // Existing fields...
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

// New table for professional connections
export const professionalConnections = pgTable("professional_connections", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id).notNull(),
  status: text("status", { 
    enum: ['pending', 'accepted', 'rejected', 'blocked'] 
  }).notNull().default('pending'),
  message: text("connection_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Professional communities/groups
export const professionalGroups = pgTable("professional_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type", { 
    enum: ['public', 'private', 'invite_only'] 
  }).notNull().default('public'),
  category: text("category").notNull(),
  rules: jsonb("rules").default([]),
  createdById: integer("created_by_id").references(() => users.id),
  memberCount: integer("member_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Group memberships
export const groupMemberships = pgTable("group_memberships", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => professionalGroups.id),
  userId: integer("user_id").references(() => users.id),
  role: text("role", { 
    enum: ['member', 'moderator', 'admin'] 
  }).notNull().default('member'),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Professional messages
export const professionalMessages = pgTable("professional_messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id),
  receiverId: integer("receiver_id").references(() => users.id),
  groupId: integer("group_id").references(() => professionalGroups.id),
  content: text("content").notNull(),
  attachments: jsonb("attachments").default([]),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Add relations
export const professionalConnectionsRelations = relations(professionalConnections, ({ one }) => ({
  requester: one(users, {
    fields: [professionalConnections.requesterId],
    references: [users.id],
  }),
  receiver: one(users, {
    fields: [professionalConnections.receiverId],
    references: [users.id],
  }),
}));

export const professionalGroupsRelations = relations(professionalGroups, ({ one, many }) => ({
  creator: one(users, {
    fields: [professionalGroups.createdById],
    references: [users.id],
  }),
  memberships: many(groupMemberships),
  messages: many(professionalMessages),
}));

export const groupMembershipsRelations = relations(groupMemberships, ({ one }) => ({
  group: one(professionalGroups, {
    fields: [groupMemberships.groupId],
    references: [professionalGroups.id],
  }),
  user: one(users, {
    fields: [groupMemberships.userId],
    references: [users.id],
  }),
}));

export const professionalMessagesRelations = relations(professionalMessages, ({ one }) => ({
  sender: one(users, {
    fields: [professionalMessages.senderId],
    references: [users.id],
  }),
  receiver: one(users, {
    fields: [professionalMessages.receiverId],
    references: [users.id],
  }),
  group: one(professionalGroups, {
    fields: [professionalMessages.groupId],
    references: [professionalGroups.id],
  }),
}));

// Update user relations
export const userRelations = relations(users, ({ many }) => ({
  sentConnections: many(professionalConnections, { relationName: "requester" }),
  receivedConnections: many(professionalConnections, { relationName: "receiver" }),
  groupMemberships: many(groupMemberships),
  sentMessages: many(professionalMessages, { relationName: "sender" }),
  receivedMessages: many(professionalMessages, { relationName: "receiver" }),
  // Keep existing relations...
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
  newsletters: many(newsletters),
  credentials: many(userCredentials),
  publications: many(userPublications),
  skills: many(userSkills),
  givenEndorsements: many(skillEndorsements, { relationName: "endorser" }),
  receivedEndorsements: many(skillEndorsements, { relationName: "endorsedUser" }),
}));

// Create Zod schemas for the new tables
export const insertProfessionalConnectionSchema = createInsertSchema(professionalConnections);
export const selectProfessionalConnectionSchema = createSelectSchema(professionalConnections);

export const insertProfessionalGroupSchema = createInsertSchema(professionalGroups);
export const selectProfessionalGroupSchema = createSelectSchema(professionalGroups);

export const insertGroupMembershipSchema = createInsertSchema(groupMemberships);
export const selectGroupMembershipSchema = createSelectSchema(groupMemberships);

export const insertProfessionalMessageSchema = createInsertSchema(professionalMessages);
export const selectProfessionalMessageSchema = createSelectSchema(professionalMessages);

// Export types for the new tables
export type ProfessionalConnection = typeof professionalConnections.$inferSelect;
export type NewProfessionalConnection = typeof professionalConnections.$inferInsert;

export type ProfessionalGroup = typeof professionalGroups.$inferSelect;
export type NewProfessionalGroup = typeof professionalGroups.$inferInsert;

export type GroupMembership = typeof groupMemberships.$inferSelect;
export type NewGroupMembership = typeof groupMemberships.$inferInsert;

export type ProfessionalMessage = typeof professionalMessages.$inferSelect;
export type NewProfessionalMessage = typeof professionalMessages.$inferInsert;

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

// Update the knowledgeEntries table to support multimedia content
export const knowledgeEntries = pgTable("knowledge_entries", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category", {
    enum: [
      'water_treatment',
      'wastewater',
      'stormwater',
      'climate_change',
      'blockchain',
      'sustainability',
      'infrastructure',
      'emerging_contaminants',
      'sea_level_rise'
    ]
  }).notNull(),
  tags: jsonb("tags").default([]),
  authorId: integer("author_id").references(() => users.id),
  expertVerified: boolean("expert_verified").default(false),
  score: integer("score").default(0),
  viewCount: integer("view_count").default(0),
  // New fields for multimedia support
  mediaType: text("media_type", { 
    enum: ['text', 'image', 'video', 'loom'] 
  }).notNull().default('text'),
  mediaUrl: text("media_url"),
  mediaThumbnail: text("media_thumbnail"),
  mediaDuration: integer("media_duration"), // For videos, in seconds
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

export const newsletters = pgTable("newsletters", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  topics: jsonb("topics").default([]),
  deliveredAt: timestamp("delivered_at").defaultNow(),
  opened: boolean("opened").default(false),
  openedAt: timestamp("opened_at"),
  clickedLinks: jsonb("clicked_links").default([]),
});

export const userCredentials = pgTable("user_credentials", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type", { enum: ['certification', 'license', 'publication'] }).notNull(),
  title: text("title").notNull(),
  issuingOrganization: text("issuing_organization").notNull(),
  issueDate: timestamp("issue_date").notNull(),
  expiryDate: timestamp("expiry_date"),
  credentialId: text("credential_id"),
  documentUrl: text("document_url"),
  verificationUrl: text("verification_url"),
  description: text("description"),
  status: text("status", { enum: ['active', 'expired', 'pending', 'revoked'] }).notNull().default('active'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userPublications = pgTable("user_publications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  authors: text("authors").notNull(),
  publicationType: text("publication_type", {
    enum: ['journal_article', 'conference_paper', 'book_chapter', 'technical_report', 'white_paper']
  }).notNull(),
  publishedIn: text("published_in").notNull(),
  publicationDate: timestamp("publication_date").notNull(),
  doi: text("doi"),
  url: text("url"),
  abstract: text("abstract"),
  citations: integer("citations").default(0),
  documentUrl: text("document_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userSkills = pgTable("user_skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  subject: text("subject").notNull(),
  level: integer("level").notNull().default(0),
  description: text("description"),
  endorsementCount: integer("endorsement_count").notNull().default(0),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const skillEndorsements = pgTable("skill_endorsements", {
  id: serial("id").primaryKey(),
  skillId: integer("skill_id").references(() => userSkills.id),
  endorserId: integer("endorser_id").references(() => users.id),
  endorsedUserId: integer("endorsed_user_id").references(() => users.id),
  comment: text("comment"),
  expertise: text("expertise", {
    enum: ['beginner', 'intermediate', 'expert']
  }).notNull(),
  validatedAt: timestamp("validated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

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

export const userCredentialRelations = relations(userCredentials, ({ one }) => ({
  user: one(users, {
    fields: [userCredentials.userId],
    references: [users.id],
  }),
}));

export const userPublicationRelations = relations(userPublications, ({ one }) => ({
  user: one(users, {
    fields: [userPublications.userId],
    references: [users.id],
  }),
}));

export const userSkillRelations = relations(userSkills, ({ one, many }) => ({
  user: one(users, {
    fields: [userSkills.userId],
    references: [users.id],
  }),
  endorsements: many(skillEndorsements),
}));

export const skillEndorsementRelations = relations(skillEndorsements, ({ one }) => ({
  skill: one(userSkills, {
    fields: [skillEndorsements.skillId],
    references: [userSkills.id],
  }),
  endorser: one(users, {
    fields: [skillEndorsements.endorserId],
    references: [users.id],
  }),
  endorsedUser: one(users, {
    fields: [skillEndorsements.endorsedUserId],
    references: [users.id],
  }),
}));

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'expert';
export type UserRole = 'user' | 'admin';
export type AchievementType = 'streak' | 'points' | 'category_mastery' | 'quiz_completion' | 'perfect_score' | 'path_completion';
export type NewsletterFrequency = 'daily' | 'weekly' | 'monthly';
export type NewsDeliveryMethod = 'email' | 'sms' | 'both';
export type NewsFrequency = 'hourly' | 'twice_daily' | 'daily';


export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
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
export type Newsletter = typeof newsletters.$inferSelect;
export type NewNewsletter = typeof newsletters.$inferInsert;
export type UserCredential = typeof userCredentials.$inferSelect;
export type NewUserCredential = typeof userCredentials.$inferInsert;
export type UserPublication = typeof userPublications.$inferSelect;
export type NewUserPublication = typeof userPublications.$inferInsert;
export type UserSkill = typeof userSkills.$inferSelect;
export type NewUserSkill = typeof userSkills.$inferInsert;
export type SkillEndorsement = typeof skillEndorsements.$inferSelect;
export type NewSkillEndorsement = typeof skillEndorsements.$inferInsert;

export const insertUserSchema = createInsertSchema(users, {
  role: z.enum(['user', 'admin']).optional(),
  points: z.number().optional(),
  streak: z.number().optional(),
  phoneNumber: z.string().optional(),
  smsNotificationsEnabled: z.boolean().optional(),
  preferredQuizTime: z.string().optional(),
  timezone: z.string().optional(),
  fullName: z.string().optional(),
  title: z.string().optional(),
  company: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  yearsOfExperience: z.number().optional(),
  specializations: z.array(z.string()).optional(),
  website: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  profileVisibility: z.enum(['public', 'connections', 'private']).optional()
});
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
export const insertNewsletterSchema = createInsertSchema(newsletters);
export const selectNewsletterSchema = createSelectSchema(newsletters);
export const insertUserCredentialSchema = createInsertSchema(userCredentials, {
  type: z.enum(['certification', 'license', 'publication']),
  status: z.enum(['active', 'expired', 'pending', 'revoked']),
});
export const selectUserCredentialSchema = createSelectSchema(userCredentials);
export const insertUserPublicationSchema = createInsertSchema(userPublications, {
  publicationType: z.enum([
    'journal_article',
    'conference_paper',
    'book_chapter',
    'technical_report',
    'white_paper'
  ]),
});
export const selectUserPublicationSchema = createSelectSchema(userPublications);
export const insertUserSkillSchema = createInsertSchema(userSkills);
export const selectUserSkillSchema = createSelectSchema(userSkills);
export const insertSkillEndorsementSchema = createInsertSchema(skillEndorsements, {
  expertise: z.enum(['beginner', 'intermediate', 'expert']),
});
export const selectSkillEndorsementSchema = createSelectSchema(skillEndorsements);