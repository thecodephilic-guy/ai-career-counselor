import {motion} from "motion/react"
import { Brain } from "lucide-react"
import { Button } from "../ui/button"

interface EmptyStateProps {
    handleSendMessage: (suggestion: string) => void;
    isLoading: boolean;
}

function EmptyState({handleSendMessage, isLoading}: EmptyStateProps) {
  return (
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
  )
}

export default EmptyState