import z from "zod";
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const chatMessageSchema = z.object({
  id: z.string().uuidv4(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.date()
})

export interface ChatSessionData {
  id: string;
  title: string;
  sessionId: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  messages: ChatMessage[];
}

export interface SessionManager {
  getSessionId: () => string;
  setSessionId: (id: string) => void;
  clearSession: () => void;
}

export interface AIResponse {
  content: string;
  error?: string;
}