import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Share2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function MicroLearning() {
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: content, isLoading, error } = useQuery({
    queryKey: ['/api/micro-learning', refreshKey],
    refetchInterval: 1000 * 60 * 60, // Refetch every hour
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'Water Industry Micro-Learning',
        text: content,
        url: window.location.href
      });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast({
          title: 'Error',
          description: 'Failed to share content',
          variant: 'destructive',
        });
      }
    }
  };

  if (error) {
    return (
      <Card className="bg-destructive/10 border-destructive/20">
        <CardContent className="pt-6">
          <p className="text-destructive">Failed to load micro-learning content</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={refreshKey}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-card">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">Today's Learning</CardTitle>
                <Badge variant="outline" className="text-xs">
                  Water Industry Trends
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleShare}
                  disabled={isLoading}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="prose prose-slate dark:prose-invert max-w-none">
                {content?.split('\n').map((line, index) => (
                  <p key={index} className="my-2">
                    {line}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            <p>Powered by AI • Updated hourly</p>
          </CardFooter>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
