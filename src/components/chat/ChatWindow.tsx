"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
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
