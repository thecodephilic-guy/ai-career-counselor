import { motion } from 'motion/react';
import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex gap-2 md:gap-3 mb-4 md:mb-6"
    >
      <div className="flex-shrink-0">
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
          <Bot className="w-3 h-3 md:w-4 md:h-4 text-primary-foreground" />
        </div>
      </div>
      
      <div className="bg-card text-card-foreground rounded-2xl px-3 md:px-4 py-2 md:py-3 shadow-lg mr-8 md:mr-12 backdrop-blur-sm border border-border/50">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
        </div>
        <div className="text-xs mt-1 md:mt-2 opacity-70 text-muted-foreground">
          AI is thinking...
        </div>
      </div>
    </motion.div>
  );
}