import { z } from "zod";

export const chatMessageSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string(),
  sessionId: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1, "Message content cannot be empty"),
  timestamp: z.date(),
});

export const fetchSessionsInput = z.object({
  clientId: z.string().uuid(),
});

export const createSessionInput = z.object({
  clientId: z.string().uuid(),
  sessionId: z.string(),
  title: z.string().min(1, "Session title cannot be empty").max(255, "Title too long"),
});

export const deleteSessionInput = z.object({
  sessionId: z.string(),
});

export const updateSessionTitleInput = z.object({
  sessionId: z.string(),
  title: z.string().min(1, "Session title cannot be empty").max(255, "Title too long"),
});

export const getSessionMessagesInput = z.object({
  sessionId: z.string(),
  limit: z.number().min(1).max(100).optional().default(50),
});

export const updateSessionActivityInput = z.object({
  sessionId: z.string(),
  isActive: z.boolean(),
});

// Export types for use in frontend
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type FetchSessionsInput = z.infer<typeof fetchSessionsInput>;
export type CreateSessionInput = z.infer<typeof createSessionInput>;
export type DeleteSessionInput = z.infer<typeof deleteSessionInput>;
export type UpdateSessionTitleInput = z.infer<typeof updateSessionTitleInput>;
export type GetSessionMessagesInput = z.infer<typeof getSessionMessagesInput>;
export type UpdateSessionActivityInput = z.infer<typeof updateSessionActivityInput>;