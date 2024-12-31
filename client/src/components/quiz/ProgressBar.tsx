import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
  streak: number;
}

export function ProgressBar({ current, total, streak }: ProgressBarProps) {
  const progress = (current / total) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto mb-8"
    >
      <div className="flex justify-between mb-2">
        <motion.span 
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          Question {current} of {total}
        </motion.span>
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-sm text-blue-500 font-medium">
            Streak: {streak}
          </span>
          {streak > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20
              }}
              className="text-lg"
            >
              🔥
            </motion.span>
          )}
        </motion.div>
      </div>
      <div className="relative">
        <Progress 
          value={progress} 
          className="h-2 bg-blue-100" 
        />
        <motion.div
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div 
            className="h-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </motion.div>
      </div>
      {streak >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-2 text-sm font-medium text-green-600"
        >
          {streak >= 5 ? "🎯 You're on fire!" : "🎯 Great streak!"}
        </motion.div>
      )}
    </motion.div>
  );
}