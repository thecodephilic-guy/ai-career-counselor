import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { 
  MessageCircle, 
  Plus, 
  PanelRightClose,
  PanelLeftClose,
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const prevSessionsLength = useRef(sessions.length);

  // Auto-scroll to top when new session is added
  useEffect(() => {
    if (sessions.length > prevSessionsLength.current) {
      // New session added, scroll to top
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
    prevSessionsLength.current = sessions.length;
  }, [sessions.length]);

  const handleNewSession = () => {
    onNewSession();
    // Auto-close sidebar on mobile after creating new session
    if (window.innerWidth < 768 && onToggleCollapse) {
      setTimeout(() => {
        onToggleCollapse();
      }, 100); // Small delay to let the new session render first
    }
  };

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
      initial={false}
      animate={{ 
        width: isCollapsed ? 60 : 320,
        transition: { 
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad for smoother motion
          type: "tween"
        }
      }}
      className="h-full bg-sidebar border-r border-sidebar-border flex flex-col relative overflow-hidden"
      style={{ 
        width: isCollapsed ? '60px' : '320px',
        minWidth: isCollapsed ? '60px' : '320px',
        maxWidth: isCollapsed ? '60px' : '320px'
      }}
    >
      {/* Header - Fixed height */}
      <div className="flex-shrink-0 p-4 border-sidebar-border">
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-start gap-2"}`}>
          {onToggleCollapse && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onToggleCollapse}
              className="p-2 hover:bg-sidebar-accent text-sidebar-foreground hidden md:flex"
            >
              {isCollapsed ? (
                <PanelRightClose className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </Button>
          )}
          
        {!isCollapsed && (
          <AnimatePresence mode="wait">
            <motion.h2
              key="sidebar-title"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ 
                duration: 0.5,
                delay: 0.2,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className="text-lg font-semibold text-sidebar-foreground flex-1"
            >
              Chat Sessions
            </motion.h2>
          </AnimatePresence>
        )}
        </div>
        
        {!isCollapsed && (
          <AnimatePresence mode="wait">
            <motion.div
              key="new-chat-button"
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.8 }}
              transition={{ 
                duration: 0.5,
                delay: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94],
                scale: {
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }
              }}
              className="mt-3"
            >
              <Button 
                onClick={handleNewSession}
                className="w-full bg-gradient-to-r from-sidebar-primary to-sidebar-primary/90 hover:from-sidebar-primary/90 hover:to-sidebar-primary text-sidebar-primary-foreground hover:scale-105 transition-transform shadow-lg shadow-sidebar-primary/25 text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            </motion.div>
          </AnimatePresence>
        )}

        {isCollapsed && (
          <AnimatePresence mode="wait">
            <motion.div
              key="collapsed-new-chat-button"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ 
                duration: 0.4,
                delay: 0.2,
                type: "spring",
                stiffness: 400,
                damping: 25
              }}
              className="mt-3 flex justify-center"
            >
              <Button 
                onClick={handleNewSession}
                size="sm"
                className="w-8 h-8 p-0 bg-gradient-to-r from-sidebar-primary to-sidebar-primary/90 hover:from-sidebar-primary/90 hover:to-sidebar-primary text-sidebar-primary-foreground hover:scale-105 transition-transform shadow-lg"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Sessions List - Scrollable area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="p-2 space-y-2">
            <AnimatePresence mode="popLayout">
              {sessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -30, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -30, scale: 0.95 }}
                  transition={{ 
                    delay: index * 0.08,
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  onMouseEnter={() => setHoveredSession(session.id)}
                  onMouseLeave={() => setHoveredSession(null)}
                >
                  <Card
                    className={cn(
                      "p-3 cursor-pointer transition-all duration-200 border-sidebar-border/50 hover:border-sidebar-primary/30 bg-sidebar/50 backdrop-blur-sm",
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
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`session-content-${session.id}`}
                            initial={{ opacity: 0, width: 0, x: -20 }}
                            animate={{ opacity: 1, width: "auto", x: 0 }}
                            exit={{ opacity: 0, width: 0, x: -20 }}
                            transition={{ 
                              duration: 0.4,
                              delay: 0.1,
                              ease: [0.25, 0.46, 0.45, 0.94]
                            }}
                            className="flex-1 min-w-0"
                          >
                            <motion.h3 
                              className="font-medium text-sm text-sidebar-foreground truncate"
                              layout="position"
                              transition={{ duration: 0.3 }}
                            >
                              {session.title}
                            </motion.h3>
                            
                            <motion.div 
                              className="flex items-center gap-2 mt-1 text-xs text-muted-foreground"
                              layout="position"
                              transition={{ duration: 0.3, delay: 0.05 }}
                            >
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(session.updatedAt)}</span>
                              <Clock className="w-3 h-3 ml-1" />
                              <span>{formatTime(session.updatedAt)}</span>
                            </motion.div>
                            
                            {session.messages.length > 0 && (
                              <motion.div 
                                className="mt-2 text-xs text-muted-foreground/80 truncate"
                                layout="position"
                                transition={{ duration: 0.3, delay: 0.1 }}
                              >
                                {session.messages[session.messages.length - 1].content.substring(0, 40)}
                                {session.messages[session.messages.length - 1].content.length > 40 && '...'}
                              </motion.div>
                            )}
                          </motion.div>
                        </AnimatePresence>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {sessions.length === 0 && !isCollapsed && (
              <AnimatePresence>
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ 
                    duration: 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  className="text-center py-8 text-muted-foreground"
                >
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      duration: 0.4,
                      delay: 0.2,
                      type: "spring",
                      stiffness: 300,
                      damping: 25
                    }}
                  >
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  </motion.div>
                  <motion.p 
                    className="text-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    No chat sessions yet
                  </motion.p>
                  <motion.p 
                    className="text-xs mt-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                  >
                    Start a new conversation to begin
                  </motion.p>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>
      </div>
    </motion.div>
  );
}