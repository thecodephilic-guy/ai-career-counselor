"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import EmptyState from "./EmptyState";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { Brain } from "lucide-react";
import { ChatMessage, ChatSessionData } from "@/lib/types";
import { RefObject } from "react";

interface ChatWindowProps {
  currentSession: ChatSessionData | null;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  scrollAreaRef: RefObject<HTMLDivElement | null>;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  handleSendMessage: (content: string) => void;
}

export function ChatWindow({
  currentSession,
  isLoading,
  isFetchingNextPage,
  scrollAreaRef,
  messagesEndRef,
  handleSendMessage,
}: ChatWindowProps) {
  const messagesTopRef = useRef<HTMLDivElement>(null);
  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea ref={scrollAreaRef} className="h-full">
        <div className="max-w-4xl mx-auto p-4 md:p-6 pb-24">
          {/* Loading indicator for fetching older messages */}
          <div ref={messagesTopRef}>
            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}
          </div>

          {(currentSession?.messages?.length || 0) === 0 ? (
            <EmptyState handleSendMessage={handleSendMessage} isLoading={isLoading} />
          ) : (
            <AnimatePresence mode="popLayout">
              {currentSession?.messages?.map((message: ChatMessage, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isLast={index === (currentSession?.messages?.length || 0) - 1}
                />
              ))}
            </AnimatePresence>
          )}

          <AnimatePresence>{isLoading && <TypingIndicator />}</AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
