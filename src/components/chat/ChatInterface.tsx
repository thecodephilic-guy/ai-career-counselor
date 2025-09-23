"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { ChatInput } from "./ChatInput";
import { SessionSidebar } from "./SessionSidebar";
import { ChatMessage, ChatSessionData } from "@/lib/types";
import { SessionManager } from "@/lib/session";
import { Sparkles, Brain, Menu } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import ThemeToggle from "../ThemeToggle";
import { useIsMobile } from "@/hooks/useMobile";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";

export function ChatInterface() {
  const [sessions, setSessions] = useState<ChatSessionData[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showMobileHeader, setShowMobileHeader] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);
  const isMobile = useIsMobile();
  const trpc = useTRPC();

  // tRPC hooks
  const sendMessage = useMutation(trpc.sendMessage.mutationOptions());
  const createSession = useMutation(trpc.createSession.mutationOptions());
  const deleteSession = useMutation(trpc.deleteSession.mutationOptions());
  const updateSessionTitle = useMutation(trpc.updateSessionTitle.mutationOptions());
  
  const { 
    data: serverSessions, 
    isLoading: loadingSessions,
    refetch: refetchSessions 
  } = useQuery(
    trpc.getSessions.queryOptions({ clientId: SessionManager.getSessionId() },
    { refetchOnWindowFocus: false })
  );

  // Initialize sessions and set initial mobile state
  useEffect(() => {
    if (!loadingSessions) {
      if (!serverSessions || serverSessions.length === 0) {
        // Create initial session if none exist
        handleNewSession();
      } else {
        setSessions(serverSessions);
        // Set the most recent session as current
        const mostRecentSession = serverSessions[0];
        setCurrentSession(mostRecentSession);
      }

      // Set initial sidebar state based on screen size
      const checkScreenSize = () => {
        setIsSidebarCollapsed(window.innerWidth < 768);
      };

      checkScreenSize();
      window.addEventListener("resize", checkScreenSize);
      setIsInitialized(true);

      return () => window.removeEventListener("resize", checkScreenSize);
    }
  }, [serverSessions, loadingSessions]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages, isLoading]);

  // Handle scroll for mobile header visibility
  useEffect(() => {
    const handleScroll = () => {
      if (!isMobile) return; // Only on mobile

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollingDown = scrollTop > lastScrollTop.current;

      if (scrollingDown && scrollTop > 100) {
        setShowMobileHeader(false);
      } else {
        setShowMobileHeader(true);
      }

      lastScrollTop.current = scrollTop;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  const handleSendMessage = async (content: string) => {
    if (!currentSession || isLoading) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      sessionId: currentSession.sessionId,
      role: "user",
      content,
      timestamp: new Date(),
    };

    // Optimistically update UI
    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, userMessage],
      updatedAt: new Date(),
    };

    setCurrentSession(updatedSession);
    setSessions((prev) =>
      prev.map((s) => (s.id === updatedSession.id ? updatedSession : s))
    );
    setIsLoading(true);

    try {
      const aiContent = await sendMessage.mutateAsync({
        id: userMessage.id,
        sessionId: userMessage.sessionId,
        role: userMessage.role,
        content: userMessage.content,
        timestamp: userMessage.timestamp,
        clientId: SessionManager.getSessionId(),
      });

      const aiMessage: ChatMessage = {
        id: uuidv4(),
        sessionId: currentSession.sessionId,
        role: "assistant",
        content: aiContent,
        timestamp: new Date(),
      };

      // Update session with AI response
      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, aiMessage],
        updatedAt: new Date(),
      };

      setCurrentSession(finalSession);
      setSessions((prev) =>
        prev.map((s) => (s.id === finalSession.id ? finalSession : s))
      );

      // Update session title if it's the first message
      if (currentSession.messages.length === 0 && currentSession.title === "New Career Chat") {
        const newTitle = generateSessionTitle(content);
        await updateSessionTitle.mutateAsync({
          sessionId: currentSession.sessionId,
          title: newTitle,
        });
        
        const titleUpdatedSession = { ...finalSession, title: newTitle };
        setCurrentSession(titleUpdatedSession);
        setSessions((prev) =>
          prev.map((s) => (s.id === titleUpdatedSession.id ? titleUpdatedSession : s))
        );
      }

    } catch (error) {
      console.error("Failed to get AI response:", error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        sessionId: currentSession.sessionId,
        role: "assistant",
        content: "I apologize, but I'm having trouble responding right now. Please try again.",
        timestamp: new Date(),
      };

      const errorSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, errorMessage],
        updatedAt: new Date(),
      };

      setCurrentSession(errorSession);
      setSessions((prev) =>
        prev.map((s) => (s.id === errorSession.id ? errorSession : s))
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSession = async () => {
    try {
      const clientId = SessionManager.getSessionId();
      const sessionId = uuidv4();
      
      const newSessionData = await createSession.mutateAsync({
        clientId,
        sessionId,
        title: "New Career Chat",
      });

      const newSession: ChatSessionData = {
        id: newSessionData.id,
        title: newSessionData.title,
        clientId: newSessionData.clientId,
        sessionId: newSessionData.sessionId,
        createdAt: newSessionData.createdAt,
        updatedAt: newSessionData.updatedAt,
        isActive: newSessionData.isActive,
        messages: [],
      };

      setSessions((prev) => [newSession, ...prev]);
      setCurrentSession(newSession);
    } catch (error) {
      console.error("Failed to create new session:", error);
      // Fallback to local session creation
      const newSession: ChatSessionData = {
        id: uuidv4(),
        title: "New Career Chat",
        clientId: SessionManager.getSessionId(),
        sessionId: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        messages: [],
      };

      setSessions((prev) => [newSession, ...prev]);
      setCurrentSession(newSession);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      
      // Auto-close sidebar on mobile after selection
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      }
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const sessionToDelete = sessions.find((s) => s.id === sessionId);
      if (!sessionToDelete) return;

      await deleteSession.mutateAsync({
        sessionId: sessionToDelete.sessionId,
      });

      const updatedSessions = sessions.filter((s) => s.id !== sessionId);
      setSessions(updatedSessions);

      // If we deleted the current session, switch to another one or create new
      if (currentSession?.id === sessionId) {
        if (updatedSessions.length > 0) {
          setCurrentSession(updatedSessions[0]);
        } else {
          handleNewSession();
        }
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  // Simple title generation function (moved to frontend for immediate feedback)
  const generateSessionTitle = (content: string): string => {
    const words = content.split(' ').slice(0, 6).join(' ');
    return words.length > 30 ? words.substring(0, 30) + '...' : words;
  };

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="h-screen flex bg-background items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary/80 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-primary/25 animate-pulse">
            <Brain className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">
            Initializing AI Career Counselor...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background relative overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {!isSidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsSidebarCollapsed(true)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div
        className={`
        fixed md:relative inset-y-0 left-0 z-50 md:z-auto
        transform transition-transform duration-300 ease-in-out
        ${
          isSidebarCollapsed
            ? "-translate-x-full md:translate-x-0"
            : "translate-x-0"
        }
        md:block
      `}
      >
        <SessionSidebar
          sessions={sessions}
          currentSessionId={currentSession?.id || ""}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
          // onDeleteSession={handleDeleteSession}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{
            opacity: 1,
            y: showMobileHeader ? 0 : -100,
          }}
          transition={{ duration: 0.3 }}
          className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border p-3 md:p-4 shadow-sm"
        >
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="md:hidden hover:bg-accent"
              >
                <Menu className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
                  <Brain className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-foreground">
                    AI Career Counselor
                  </h1>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {currentSession?.title || "Your personal career assistant"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4" />
                <span>Always here to help</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </motion.header>

        {/* Messages Container */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea ref={scrollAreaRef} className="h-full">
              <div className="max-w-4xl mx-auto p-4 md:p-6 pb-24">
                {currentSession?.messages.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16"
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-primary/80 mx-auto mb-6 flex items-center justify-center shadow-xl shadow-primary/30">
                      <Brain className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                      Welcome to Your AI Career Counselor
                    </h2>
                    <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                      {`I'm here to support your career journey. Whether it's resume
                      tips, interview prep, career transitions, skill growth, or
                      tackling professional challenges, feel free to ask.`}
                    </p>
                    <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto px-4">
                      {[
                        "How can I improve my resume?",
                        "Tips for salary negotiation?",
                        "Best way to change careers?",
                      ].map((suggestion, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          onClick={() => handleSendMessage(suggestion)}
                          className="text-left p-4 h-auto bg-card/50 backdrop-blur-sm hover:bg-card hover:border-primary/30 transition-all duration-200 text-sm"
                          disabled={isLoading}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {currentSession?.messages.map((message, index) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isLast={
                          index === (currentSession?.messages.length || 0) - 1
                        }
                      />
                    ))}
                  </AnimatePresence>
                )}

                <AnimatePresence>
                  {isLoading && <TypingIndicator />}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}