"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import LoadingState from "./LoadingState";
import Header from "./Header";
import { ChatWindow } from "./ChatWindow";
import { ChatInput } from "./ChatInput";
import { SessionSidebar } from "./SessionSidebar";
import { ChatMessage, ChatSessionData } from "@/lib/types";
import { SessionManager } from "@/lib/session";
import { v4 as uuidv4 } from "uuid";
import { useIsMobile } from "@/hooks/useMobile";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export function ChatInterface() {
  const [sessions, setSessions] = useState<ChatSessionData[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSessionData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [deletingSession, setDeletingSession] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);
  const isMobile = useIsMobile();
  const trpc = useTRPC();

  // tRPC hooks
  const sendMessage = useMutation(trpc.sendMessage.mutationOptions());
  const createSession = useMutation(trpc.createSession.mutationOptions());
  const deleteSession = useMutation(trpc.deleteSession.mutationOptions());
  const updateSessionTitle = useMutation(
    trpc.updateSessionTitle.mutationOptions()
  );
  const clearAllSessions = useMutation(trpc.clearAllSessions.mutationOptions());

  const {
    data: serverSessions,
    isLoading: loadingSessions,
    refetch: refetchSessions,
  } = useQuery(
    trpc.getSessions.queryOptions(
      { clientId: SessionManager.getSessionId() },
      { refetchOnWindowFocus: false }
    )
  );

  // Infinite query for messages when we have a current session
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loadingMessages,
    refetch: refetchMessages,
  } = useInfiniteQuery(
    trpc.getPaginatedMessages.infiniteQueryOptions(
      currentSession
        ? { sessionId: currentSession.sessionId, limit: 50 }
        : { sessionId: "", limit: 50 },
      {
        enabled: !!currentSession,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        refetchOnWindowFocus: false,
      }
    )
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

  // Update current session messages when infinite query data changes
  useEffect(() => {
    if (messagesData && currentSession) {
      const allMessages = messagesData.pages.flatMap((page) => page.messages);

      const updatedSession = {
        ...currentSession,
        messages: allMessages,
      };

      setCurrentSession(updatedSession);
    }
  }, [messagesData, currentSession?.sessionId]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages?.length, isLoading]);

  // Handle scroll for mobile header visibility and infinite scroll
  const handleScroll = useCallback(() => {
    if (!scrollAreaRef.current) return;

    const viewport = scrollAreaRef.current.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (!viewport) return;

    const scrollTop = viewport.scrollTop;

    // Infinite scroll for loading older messages
    if (scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }

    lastScrollTop.current = scrollTop;
  }, [isMobile, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (viewport) {
      viewport.addEventListener("scroll", handleScroll, { passive: true });
      return () => viewport.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

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
      messages: [...(currentSession.messages || []), userMessage],
      updatedAt: new Date(),
    };

    setCurrentSession(updatedSession);
    setSessions((prev) =>
      prev.map((s) => (s.id === updatedSession.id ? updatedSession : s))
    );
    setIsLoading(true);

    try {
      const response = await sendMessage.mutateAsync({
        ...userMessage,
        clientId: SessionManager.getSessionId(),
      });

      const aiMessage: ChatMessage = {
        id: uuidv4(),
        sessionId: currentSession.sessionId,
        role: "assistant",
        content: response.content, // Handle both old and new response formats
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
      if (
        (currentSession.messages?.length || 0) === 0 &&
        currentSession.title === "New Career Chat"
      ) {
        const newTitle = generateSessionTitle(content);
        await updateSessionTitle.mutateAsync({
          sessionId: currentSession.sessionId,
          title: newTitle,
        });

        const titleUpdatedSession = { ...finalSession, title: newTitle };
        setCurrentSession(titleUpdatedSession);
        setSessions((prev) =>
          prev.map((s) =>
            s.id === titleUpdatedSession.id ? titleUpdatedSession : s
          )
        );
      }

      // Refetch messages to ensure consistency
      await refetchMessages();
    } catch (error) {
      console.error("Failed to get AI response:", error);

      // Add error message
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        sessionId: currentSession.sessionId,
        role: "assistant",
        content:
          "I apologize, but I'm having trouble responding right now. Please try again.",
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
    if (
      currentSession &&
      currentSession.title === "New Career Chat" &&
      (currentSession.messages?.length || 0) === 0
    ) {
      toast.warning("New chat already exists");
      return;
    }

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
      toast.error("Failed to create new session");
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
    setDeletingSession(true);
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
          await handleNewSession();
        }
      }

      toast.success("Session deleted successfully");
    } catch (error) {
      console.error("Failed to delete session:", error);
      toast.error("Failed to delete session");
    } finally{
      setDeletingSession(false);
    }
  };

  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    try {
      const sessionToUpdate = sessions.find((s) => s.id === sessionId);
      if (!sessionToUpdate) return;

      await updateSessionTitle.mutateAsync({
        sessionId: sessionToUpdate.sessionId,
        title: newTitle,
      });

      // Update local state
      const updatedSessions = sessions.map((s) =>
        s.id === sessionId ? { ...s, title: newTitle } : s
      );
      setSessions(updatedSessions);

      if (currentSession?.id === sessionId) {
        setCurrentSession({ ...currentSession, title: newTitle });
      }

      toast.success("Session renamed successfully");
    } catch (error) {
      console.error("Failed to rename session:", error);
      toast.error("Failed to rename session");
    }
  };

  const handleClearAllSessions = async () => {
    try {
      await clearAllSessions.mutateAsync({
        clientId: SessionManager.getSessionId(),
      });

      // Clear local storage session ID
      SessionManager.clearSession();

      // Reset all local state
      setSessions([]);
      setCurrentSession(null);

      // Create a new session
      await handleNewSession();

      toast.success("All sessions cleared successfully");
    } catch (error) {
      console.error("Failed to clear all sessions:", error);
      toast.error("Failed to clear all sessions");
    }
  };

  // Simple title generation function
  const generateSessionTitle = (content: string): string => {
    const words = content.split(" ").slice(0, 6).join(" ");
    return words.length > 30 ? words.substring(0, 30) + "..." : words;
  };

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <LoadingState />
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
          onDeleteSession={handleDeleteSession}
          isDeleting={deletingSession}
          onRenameSession={handleRenameSession}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onSessionClear={handleClearAllSessions}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <Header
          currentSession={currentSession}
          isCollapsed={isSidebarCollapsed}
          toggleSidebar={setIsSidebarCollapsed}
        />

        {/* Messages Container */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <ChatWindow
            currentSession={currentSession}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            scrollAreaRef={scrollAreaRef}
            messagesEndRef={messagesEndRef}
            handleSendMessage={handleSendMessage}
            hasNextPage={hasNextPage}
          />

          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
