export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatSessionData {
  id: string;
  title: string;
  clientId: string | null;
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