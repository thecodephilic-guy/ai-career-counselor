import { useState, useEffect } from "react";
import { ChatSessionData } from "@/lib/types";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { SessionManager } from "@/lib/session";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSessionData[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSessionData | null>(null);
  const [deletingSession, setDeletingSession] = useState<boolean>(false);

  const trpc = useTRPC();

  const createSession = useMutation(trpc.createSession.mutationOptions());
  const deleteSession = useMutation(trpc.deleteSession.mutationOptions());
  const updateSessionTitle = useMutation(trpc.updateSessionTitle.mutationOptions());

  const { data: serverSessions, isLoading } = useQuery(
    trpc.getSessions.queryOptions(
      { clientId: SessionManager.getSessionId() },
      { refetchOnWindowFocus: false }
    )
  );

  useEffect(() => {
    if (!isLoading) {
      if (!serverSessions || serverSessions.length === 0) {
        handleNewSession();
      } else {
        setSessions(serverSessions);
        setCurrentSession(serverSessions[0]);
      }
    }
  }, [serverSessions, isLoading]);

  const handleNewSession = async () => {
    const clientId = SessionManager.getSessionId();
    const sessionId = uuidv4();

    const newSessionData = await createSession.mutateAsync({
      clientId,
      sessionId,
      title: "New Career Chat",
    });

    const newSession = { ...newSessionData, messages: [] };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSession(newSession);
  };

  const handleDeleteSession = async (sessionId: string) => {
    setDeletingSession(true);
    try {
      await deleteSession.mutateAsync({ sessionId });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (currentSession?.id === sessionId) setCurrentSession(sessions[0] || null);
      toast.success("Session deleted");
    } finally {
      setDeletingSession(false);
    }
  };

  const handleRenameSession = async (id: string, title: string) => {
    await updateSessionTitle.mutateAsync({ sessionId: id, title });
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title } : s)));
  };

  return {
    sessions,
    setSessions,
    currentSession,
    setCurrentSession,
    deletingSession,
    handleNewSession,
    handleDeleteSession,
    handleRenameSession,
  };
}