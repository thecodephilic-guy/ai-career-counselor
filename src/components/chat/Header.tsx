import ThemeToggle from "../ThemeToggle";
import { Sparkles, Brain, Menu } from "lucide-react";
import { Button } from "../ui/button";
import { ChatSessionData } from "@/lib/types";

interface HeaderProps {
  currentSession: ChatSessionData | null;
  isCollapsed: boolean;
  toggleSidebar: (value: boolean) => void;
}

function Header({ currentSession, isCollapsed, toggleSidebar }: HeaderProps) {
  return (
    <header
      
      className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border p-3 md:p-4 shadow-sm"
    >
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {toggleSidebar(!isCollapsed)}}
            className="md:hidden hover:bg-accent"
          >
            <Menu className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
              <Brain className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">
                AI Career Counselor
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                {currentSession?.title || "Your personal career assistant"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span>Always here to help</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export default Header;
