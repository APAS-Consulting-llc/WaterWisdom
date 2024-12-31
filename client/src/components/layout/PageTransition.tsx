import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { LoadingAnimation } from '@/components/ui/LoadingAnimation';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const [location] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState(children);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleTransition = async () => {
      setIsLoading(true);
      
      // Simulate minimum loading time for smooth transitions
      timeout = setTimeout(() => {
        setContent(children);
        setIsLoading(false);
      }, 800);
    };

    handleTransition();

    return () => {
      clearTimeout(timeout);
    };
  }, [location, children]);

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LoadingAnimation size="lg" />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
