import { motion } from "motion/react";
import { Brain } from "lucide-react";

function LoadingState() {
  return (
    <div className="h-screen flex bg-background items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary/80 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-primary/25 animate-pulse">
            <Brain className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">
            Initializing AI Career Counselor...
          </p>
        </motion.div>
      </div>
  )
}

export default LoadingState