import { v4 as uuidv4 } from 'uuid';

const SESSION_KEY = 'career_counselor_session_id';

export class SessionManager {
  static getSessionId(): string {
    if (typeof window === 'undefined') return uuidv4();
    
    let sessionId = localStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = uuidv4();
      this.setSessionId(sessionId);
    }
    return sessionId;
  }

  static setSessionId(id: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEY, id);
    }
  }

  static clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_KEY);
    }
  }
}