"use client"

import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizonal, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, isLoading, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-t border-border bg-card/80 backdrop-blur-md p-3 md:p-4"
    >
      <div className="flex gap-2 md:gap-3 items-end max-w-4xl mx-auto">
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your career..."
            className="min-h-[44px] md:min-h-[48px] max-h-32 resize-none bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-colors text-sm md:text-base"
            disabled={disabled || isLoading}
          />
        </div>
        
        <Button
          onClick={handleSend}
          disabled={!message.trim() || isLoading || disabled}
          className="h-11 w-11 md:h-12 md:w-12 p-0 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground hover:scale-105 transition-all duration-200 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:hover:scale-100"
        >
          {isLoading ? (
            <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
          ) : (
            <SendHorizonal className="w-3 h-3 md:w-4 md:h-4" />
          )}
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground mt-2 text-center px-2">
        Press Enter to send, Shift+Enter for new line
      </div>
    </motion.div>
  );
}