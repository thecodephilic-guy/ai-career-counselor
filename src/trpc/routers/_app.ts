import { createTRPCRouter, baseProcedure } from "../init";
import {
  chatMessageSchema,
  fetchSessionsInput,
  createSessionInput,
  deleteSessionInput,
  updateSessionTitleInput,
  getSessionMessagesInput,
  updateSessionActivityInput,
} from "../utils/types";
import { generateAIResponse, generateContextualAIResponse } from "../gemini";
import { chatMessages } from "../db/schema";
import { chatSessions } from "../db/schema";
import { desc, eq, lt, and } from "drizzle-orm";
import { generateSessionTitle } from "../utils/shared";
import { z } from "zod";

// New schema for paginated messages
const getPaginatedMessagesInput = z.object({
  sessionId: z.string(),
  limit: z.number().min(1).max(100).default(50),
  cursor: z.string().optional(), // cursor for pagination (message ID)
});

export const appRouter = createTRPCRouter({
  /**
   * Send a message and get AI response
   */
  sendMessage: baseProcedure
    .input(chatMessageSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { content, clientId, sessionId, role, timestamp } = input;

      try {
        // 1. Ensure chat session exists for this user
        let [session] = await db
          .select()
          .from(chatSessions)
          .where(eq(chatSessions.sessionId, sessionId))
          .orderBy(desc(chatSessions.updatedAt))
          .limit(1);

        if (!session) {
          // Create a new chat session
          [session] = await db
            .insert(chatSessions)
            .values({
              clientId,
              sessionId,
              title: generateSessionTitle(content),
            })
            .returning();
        }

        // 2. Insert user message
        const [userMessage] = await db
          .insert(chatMessages)
          .values({
            sessionId, // user's sessionId
            chatSessionId: session.id, // chat session UUID
            role,
            content,
            timestamp,
          })
          .returning();

        // 3. Get recent message history for context (last 20 messages)
        const recentMessages = await db
          .select({
            role: chatMessages.role,
            content: chatMessages.content,
            timestamp: chatMessages.timestamp,
          })
          .from(chatMessages)
          .where(eq(chatMessages.chatSessionId, session.id))
          .orderBy(desc(chatMessages.timestamp))
          .limit(20);

        // Reverse to get chronological order (oldest first)
        const messageHistory = recentMessages.reverse();

        // 4. Generate AI response with context
        let aiContent: string;
        try {
          if (messageHistory.length <= 1) {
            // First message, use simple response
            aiContent = await generateAIResponse(content);
          } else {
            // Use contextual response with message history
            aiContent = await generateContextualAIResponse(content, messageHistory);
          }
        } catch (err) {
          console.error("AI generation failed:", err);
          aiContent =
            "⚠️ Sorry, I'm having trouble responding right now. Please try again.";
        }

        // 5. Insert assistant message
        const [aiMessage] = await db
          .insert(chatMessages)
          .values({
            sessionId,
            chatSessionId: session.id,
            role: "assistant",
            content: aiContent,
            timestamp: new Date(),
          })
          .returning();

        // 6. Update session timestamp
        await db
          .update(chatSessions)
          .set({ updatedAt: new Date() })
          .where(eq(chatSessions.id, session.id));

        return {
          content: aiContent,
          userMessageId: userMessage.id,
          aiMessageId: aiMessage.id,
        };
      } catch (err) {
        console.error("Unexpected sendMessage error:", err);
        throw new Error("Failed to send message. Please try again.");
      }
    }),

  /**
   * Get paginated messages for a session
   */
  getPaginatedMessages: baseProcedure
    .input(getPaginatedMessagesInput)
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { sessionId, limit, cursor } = input;

      try {
        // First, find the session to get its ID
        const [session] = await db
          .select()
          .from(chatSessions)
          .where(eq(chatSessions.sessionId, sessionId))
          .limit(1);

        if (!session) {
          throw new Error("Session not found");
        }

        // Build conditions array for dynamic where clause
        const conditions = [eq(chatMessages.chatSessionId, session.id)];

        // If cursor is provided, get messages before this cursor (for loading older messages)
        if (cursor) {
          const cursorMessage = await db
            .select({ timestamp: chatMessages.timestamp })
            .from(chatMessages)
            .where(eq(chatMessages.id, cursor))
            .limit(1);

          if (cursorMessage[0]) {
            conditions.push(lt(chatMessages.timestamp, cursorMessage[0].timestamp));
          }
        }

        // Build the complete query with all conditions
        const messages = await db
          .select({
            id: chatMessages.id,
            sessionId: chatMessages.sessionId,
            role: chatMessages.role,
            content: chatMessages.content,
            timestamp: chatMessages.timestamp,
          })
          .from(chatMessages)
          .where(and(...conditions))
          .orderBy(desc(chatMessages.timestamp))
          .limit(limit + 1); // Get one extra to check if there are more

        // Check if there are more messages
        const hasNextPage = messages.length > limit;
        const resultMessages = hasNextPage ? messages.slice(0, -1) : messages;

        // Reverse to get chronological order (oldest first)
        resultMessages.reverse();

        // Get the cursor for the next page (oldest message id)
        const nextCursor = hasNextPage && messages.length > 0
          ? messages[messages.length - 2].id // Second to last because we sliced off the last one
          : null;

        return {
          messages: resultMessages,
          nextCursor,
          hasNextPage,
        };
      } catch (err) {
        console.error("Failed to get paginated messages:", err);
        throw new Error("Failed to retrieve messages. Please try again.");
      }
    }),

  /**
   * Get all sessions for a client (now loads only basic session info, messages loaded separately)
   */
  getSessions: baseProcedure
    .input(fetchSessionsInput)
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { clientId } = input;

      const sessions = await db
        .select()
        .from(chatSessions)
        .where(eq(chatSessions.clientId, clientId))
        .orderBy(desc(chatSessions.updatedAt));

      // For each session, get only the latest message for preview
      const result = await Promise.all(
        sessions.map(async (session) => {
          const latestMessages = await db
            .select({
              id: chatMessages.id,
              sessionId: chatMessages.sessionId,
              role: chatMessages.role,
              content: chatMessages.content,
              timestamp: chatMessages.timestamp,
            })
            .from(chatMessages)
            .where(eq(chatMessages.chatSessionId, session.id))
            .orderBy(desc(chatMessages.timestamp))
            .limit(20); // Get last 20 messages for initial load

          // Reverse to get chronological order
          const messages = latestMessages.reverse();

          return {
            ...session,
            messages,
          };
        })
      );

      return result;
    }),

  /**
   * Create a new chat session
   */
  createSession: baseProcedure
    .input(createSessionInput)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { clientId, sessionId, title } = input;

      try {
        const [newSession] = await db
          .insert(chatSessions)
          .values({
            clientId,
            sessionId,
            title,
          })
          .returning();

        return newSession;
      } catch (err) {
        console.error("Failed to create session:", err);
        throw new Error("Failed to create new session. Please try again.");
      }
    }),

  /**
   * Delete a chat session and all its messages
   */
  deleteSession: baseProcedure
    .input(deleteSessionInput)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { sessionId } = input;

      try {
        // First, find the session to get its ID
        const [session] = await db
          .select()
          .from(chatSessions)
          .where(eq(chatSessions.sessionId, sessionId))
          .limit(1);

        if (!session) {
          throw new Error("Session not found");
        }

        // Delete all messages for this session
        await db
          .delete(chatMessages)
          .where(eq(chatMessages.chatSessionId, session.id));

        // Delete the session itself
        await db
          .delete(chatSessions)
          .where(eq(chatSessions.id, session.id));

        return { success: true, sessionId };
      } catch (err) {
        console.error("Failed to delete session:", err);
        throw new Error("Failed to delete session. Please try again.");
      }
    }),

  /**
   * Update session title
   */
  updateSessionTitle: baseProcedure
    .input(updateSessionTitleInput)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { sessionId, title } = input;

      try {
        const [updatedSession] = await db
          .update(chatSessions)
          .set({
            title,
            updatedAt: new Date(),
          })
          .where(eq(chatSessions.sessionId, sessionId))
          .returning();

        if (!updatedSession) {
          throw new Error("Session not found");
        }

        return updatedSession;
      } catch (err) {
        console.error("Failed to update session title:", err);
        throw new Error("Failed to update session title. Please try again.");
      }
    }),

  /**
   * Get messages for a specific session (kept for backward compatibility)
   */
  getSessionMessages: baseProcedure
    .input(getSessionMessagesInput)
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { sessionId, limit = 50 } = input;

      try {
        // First, find the session to get its ID
        const [session] = await db
          .select()
          .from(chatSessions)
          .where(eq(chatSessions.sessionId, sessionId))
          .limit(1);

        if (!session) {
          throw new Error("Session not found");
        }

        const messages = await db
          .select({
            id: chatMessages.id,
            sessionId: chatMessages.sessionId,
            role: chatMessages.role,
            content: chatMessages.content,
            timestamp: chatMessages.timestamp,
          })
          .from(chatMessages)
          .where(eq(chatMessages.chatSessionId, session.id))
          .orderBy(chatMessages.timestamp)
          .limit(limit);

        return messages;
      } catch (err) {
        console.error("Failed to get session messages:", err);
        throw new Error("Failed to retrieve messages. Please try again.");
      }
    }),

  /**
   * Update session activity status
   */
  updateSessionActivity: baseProcedure
    .input(updateSessionActivityInput)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { sessionId, isActive } = input;

      try {
        const [updatedSession] = await db
          .update(chatSessions)
          .set({
            isActive,
            updatedAt: new Date(),
          })
          .where(eq(chatSessions.sessionId, sessionId))
          .returning();

        if (!updatedSession) {
          throw new Error("Session not found");
        }

        return updatedSession;
      } catch (err) {
        console.error("Failed to update session activity:", err);
        throw new Error("Failed to update session activity. Please try again.");
      }
    }),

  /**
   * Get session count for a client
   */
  getSessionCount: baseProcedure
    .input(fetchSessionsInput)
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { clientId } = input;

      try {
        const sessions = await db
          .select()
          .from(chatSessions)
          .where(eq(chatSessions.clientId, clientId));

        return { count: sessions.length };
      } catch (err) {
        console.error("Failed to get session count:", err);
        return { count: 0 };
      }
    }),

  /**
   * Clear all sessions for a client
   */
  clearAllSessions: baseProcedure
    .input(fetchSessionsInput)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { clientId } = input;

      try {
        // Get all sessions for this client
        const sessions = await db
          .select()
          .from(chatSessions)
          .where(eq(chatSessions.clientId, clientId));

        // Delete all messages for all sessions
        for (const session of sessions) {
          await db
            .delete(chatMessages)
            .where(eq(chatMessages.chatSessionId, session.id));
        }

        // Delete all sessions
        await db
          .delete(chatSessions)
          .where(eq(chatSessions.clientId, clientId));

        return { success: true, deletedCount: sessions.length };
      } catch (err) {
        console.error("Failed to clear all sessions:", err);
        throw new Error("Failed to clear all sessions. Please try again.");
      }
    }),
});

export type AppRouter = typeof appRouter;