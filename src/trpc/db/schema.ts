import { pgTable, serial, text, timestamp, boolean, varchar, uuid, integer, pgEnum } from "drizzle-orm/pg-core";

export const chatRole = pgEnum("chat_role", ["user", "assistant"]);

export const chatSessions = pgTable("chat_sessions", {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  clientId: uuid("client_id").defaultRandom(),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  chatSessionId: uuid("chat_session_id")
    .notNull()
    .references(() => chatSessions.id),
  role: chatRole("role").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});