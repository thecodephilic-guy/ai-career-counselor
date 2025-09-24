import React from 'react';
import { motion } from 'motion/react';
import { ChatMessage } from '@/lib/types';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: ChatMessage;
  isLast?: boolean;
}

// Simple markdown parser for common patterns
function parseMarkdown(text: string): React.ReactNode {
  // First, let's clean up the text and split into lines
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Handle numbered lists (1., 2., etc.)
    const numberedMatch = line.match(/^(\d+)\.\s*(.+)$/);
    if (numberedMatch) {
      const [, number, content] = numberedMatch;
      elements.push(
        <div key={key++} className="flex gap-2 mb-2">
          <span className="font-semibold min-w-[1.5rem]">{number}.</span>
          <div className="flex-1">{parseInlineMarkdown(content)}</div>
        </div>
      );
      continue;
    }

    // Handle bullet points (*, •)
    if (line.startsWith('*') && !line.startsWith('**')) {
      const content = line.substring(1).trim();
      elements.push(
        <div key={key++} className="flex gap-2 mb-1 ml-4">
          <span className="min-w-[1rem]">•</span>
          <div className="flex-1">{parseInlineMarkdown(content)}</div>
        </div>
      );
      continue;
    }

    // Handle regular paragraphs
    elements.push(
      <div key={key++} className="mb-3 last:mb-0">
        {parseInlineMarkdown(line)}
      </div>
    );
  }

  return <>{elements}</>;
}

// Parse inline markdown (bold, italic, links)
function parseInlineMarkdown(text: string): React.ReactNode {
  const elements: React.ReactNode[] = [];
  let currentIndex = 0;
  let key = 0;

  // Combined regex for markdown patterns and links
  // This regex matches: ***text***, **text**, *text*, [text](url), and standalone URLs
  const markdownRegex = /(\*{1,3})(.*?)\1|(\[([^\]]+)\]\(([^)]+)\))|(https?:\/\/[^\s\)]+)/g;
  let match;

  while ((match = markdownRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > currentIndex) {
      elements.push(text.substring(currentIndex, match.index));
    }

    if (match[1] && match[2]) {
      // Markdown formatting (*text*, **text**, ***text***)
      const asteriskCount = match[1].length;
      const content = match[2];

      if (asteriskCount >= 2) {
        // **text** or ***text*** -> bold
        elements.push(
          <strong key={key++} className="font-semibold">
            {content}
          </strong>
        );
      } else {
        // *text* -> italic
        elements.push(
          <em key={key++} className="italic">
            {content}
          </em>
        );
      }
    } else if (match[3]) {
      // Markdown link [text](url)
      const linkText = match[4];
      const url = match[5];
      elements.push(
        <a
          key={key++}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 underline decoration-blue-500/30 hover:decoration-blue-600 transition-colors"
        >
          {linkText}
        </a>
      );
    } else if (match[6]) {
      // Standalone URL
      const url = match[6];
      elements.push(
        <a
          key={key++}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 underline decoration-blue-500/30 hover:decoration-blue-600 transition-colors break-all"
        >
          {url}
        </a>
      );
    }

    currentIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (currentIndex < text.length) {
    elements.push(text.substring(currentIndex));
  }

  // If no markdown was found, return the original text
  return elements.length > 0 ? <>{elements}</> : text;
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
        <div className="text-sm leading-relaxed">
          {isUser ? (
            // For user messages, keep simple whitespace formatting
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            // For AI messages, apply markdown parsing with link support
            <div className="space-y-1">
              {parseMarkdown(message.content)}
            </div>
          )}
        </div>
        <div className={cn(
          "text-xs mt-2 md:mt-3 opacity-70",
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