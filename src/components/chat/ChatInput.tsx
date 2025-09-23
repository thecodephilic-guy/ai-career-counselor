"use client"

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      
      // Calculate new height based on content
      const scrollHeight = textareaRef.current.scrollHeight;
      const minHeight = 44; // Minimum height for mobile
      const maxHeight = 120; // Maximum height (~3-4 lines)
      
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      // Reset textarea height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = '44px';
      }
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
      className="sticky bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur-md p-3 md:p-4 shadow-lg"
    >
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex gap-2 md:gap-3 items-end w-full">
          <div className="flex-1 min-w-0">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="How can I help you?"
              className="w-full min-h-[44px] md:min-h-[48px] max-h-[120px] resize-none bg-muted/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 text-sm md:text-base overflow-y-auto overflow-x-hidden no-scrollbar break-words whitespace-pre-wrap"
              style={{
                lineHeight: '1.5',
                paddingTop: '12px',
                paddingBottom: '12px',
                paddingLeft: '12px',
                paddingRight: '48px', // Space for button on mobile
                wordWrap: 'break-word',
                wordBreak: 'break-word',
                overflowWrap: 'break-word'
              }}
              disabled={disabled || isLoading}
              rows={1}
            />
          </div>
          
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isLoading || disabled}
            className="h-11 w-11 md:h-12 md:w-12 p-0 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground hover:scale-105 transition-all duration-200 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:hover:scale-100 flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <SendHorizonal className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground mt-2 text-center px-2 hidden md:block">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </motion.div>
  );
}