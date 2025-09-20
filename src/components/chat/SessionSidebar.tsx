import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { 
  MessageCircle, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Clock
} from 'lucide-react';
import { ChatSessionData } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SessionSidebarProps {
  sessions: ChatSessionData[];
  currentSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function SessionSidebar({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewSession,
  isCollapsed = false,
  onToggleCollapse 
}: SessionSidebarProps) {
  const [hoveredSession, setHoveredSession] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      initial={{ width: isCollapsed ? 0 : 320 }}
      animate={{ width: isCollapsed ? 0 : 320 }}
      transition={{ duration: 0.3 }}
      className="h-full bg-sidebar border-r border-sidebar-border flex flex-col relative"
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-lg font-semibold text-sidebar-foreground"
            >
              Chat Sessions
            </motion.h2>
          )}
          
          {onToggleCollapse && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onToggleCollapse}
              className="p-2 hover:bg-sidebar-accent text-sidebar-foreground"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
        
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-3"
          >
            <Button 
              onClick={onNewSession}
              className="w-full bg-gradient-to-r from-sidebar-primary to-sidebar-primary/90 hover:from-sidebar-primary/90 hover:to-sidebar-primary text-sidebar-primary-foreground hover:scale-105 transition-transform shadow-lg shadow-sidebar-primary/25"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </motion.div>
        )}

        {isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 flex justify-center"
          >
            <Button 
              onClick={onNewSession}
              size="sm"
              className="w-8 h-8 p-0 bg-gradient-to-r from-sidebar-primary to-sidebar-primary/90 hover:from-sidebar-primary/90 hover:to-sidebar-primary text-sidebar-primary-foreground hover:scale-105 transition-transform shadow-lg"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </motion.div>
        )}
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-1 p-2">
        <AnimatePresence mode="popLayout">
          {sessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
              onMouseEnter={() => setHoveredSession(session.id)}
              onMouseLeave={() => setHoveredSession(null)}
            >
              <Card
                className={cn(
                  "mb-2 p-3 cursor-pointer transition-all duration-200 border-sidebar-border/50 hover:border-sidebar-primary/30 bg-sidebar/50 backdrop-blur-sm",
                  currentSessionId === session.id 
                    ? "bg-sidebar-primary/10 border-sidebar-primary/40 shadow-lg shadow-sidebar-primary/20" 
                    : "hover:bg-sidebar/80",
                  isCollapsed && "p-2"
                )}
                onClick={() => onSelectSession(session.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "flex-shrink-0 rounded-full flex items-center justify-center transition-colors",
                    isCollapsed ? "w-6 h-6" : "w-8 h-8",
                    currentSessionId === session.id 
                      ? "bg-gradient-to-r from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground shadow-md" 
                      : "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}>
                    <MessageCircle className={cn(
                      isCollapsed ? "w-3 h-3" : "w-4 h-4"
                    )} />
                  </div>
                  
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <motion.h3 
                        className="font-medium text-sm text-sidebar-foreground truncate"
                        layout
                      >
                        {session.title}
                      </motion.h3>
                      
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(session.updatedAt)}</span>
                        <Clock className="w-3 h-3 ml-1" />
                        <span>{formatTime(session.updatedAt)}</span>
                      </div>
                      
                      {session.messages.length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground/80 truncate">
                          {session.messages[session.messages.length - 1].content.substring(0, 60)}
                          {session.messages[session.messages.length - 1].content.length > 60 && '...'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {sessions.length === 0 && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-muted-foreground"
          >
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No chat sessions yet</p>
            <p className="text-xs mt-1">Start a new conversation to begin</p>
          </motion.div>
        )}
      </ScrollArea>
    </motion.div>
  );
}