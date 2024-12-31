import { motion } from 'framer-motion';

interface LoadingAnimationProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingAnimation({ size = 'md', className = '' }: LoadingAnimationProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className="relative"
        initial="start"
        animate="end"
        variants={{
          start: {
            scale: 0.5,
            opacity: 0.3
          },
          end: {
            scale: 1,
            opacity: 1
          }
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      >
        <svg
          className={`${sizes[size]} text-blue-500`}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            d="M50 5
              C50 5 20 35 20 60
              C20 80 35 95 50 95
              C65 95 80 80 80 60
              C80 35 50 5 50 5Z"
            fill="currentColor"
            initial={{ opacity: 0.2 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
          <motion.circle
            cx="50"
            cy="45"
            r="8"
            fill="white"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.6, scale: 1 }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: 0.2
            }}
          />
        </svg>
      </motion.div>
    </div>
  );
}
