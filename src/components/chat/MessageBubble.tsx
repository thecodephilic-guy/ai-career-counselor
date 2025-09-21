import { motion } from 'motion/react';
import { ChatMessage } from '@/lib/types';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: ChatMessage;
  isLast?: boolean;
}

export function MessageBubble({ message, isLast }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-2 md:gap-3 mb-4 md:mb-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
            <Bot className="w-3 h-3 md:w-4 md:h-4 text-primary-foreground" />
          </div>
        </div>
      )}
      
      <div className={cn(
        "max-w-[85%] md:max-w-[80%] rounded-2xl px-3 md:px-4 py-2 md:py-3 shadow-lg backdrop-blur-sm border",
        isUser 
          ? "bg-primary text-primary-foreground ml-8 md:ml-12 border-primary/20" 
          : "bg-card text-card-foreground mr-8 md:mr-12 border-border/50"
      )}>
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
        <div className={cn(
          "text-xs mt-1 md:mt-2 opacity-70",
          isUser ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-secondary to-secondary/80 flex items-center justify-center shadow-md">
            <User className="w-3 h-3 md:w-4 md:h-4 text-secondary-foreground" />
          </div>
        </div>
      )}
    </motion.div>
  );
}