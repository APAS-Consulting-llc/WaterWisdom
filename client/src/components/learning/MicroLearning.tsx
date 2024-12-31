import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { ShareButtons } from '@/components/ui/ShareButtons';

interface MicroLearningContent {
  title: string;
  content: string;
  author?: string;
  timestamp: string;
}

export default function MicroLearning() {
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: content, isLoading, error } = useQuery<MicroLearningContent>({
    queryKey: ['/api/micro-learning', refreshKey],
    refetchInterval: 1000 * 60 * 60, // Refetch every hour
    retry: 1,
    onError: (err) => {
      toast({
        title: 'Error loading content',
        description: 'Failed to load learning content. Please try again later.',
        variant: 'destructive',
      });
    }
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = content ? 
    `${content.title}\n\nPowered by One Water Hub` : 
    'Check out this water industry insight from One Water Hub';
  const shareTitle = content?.title || 'Water Industry Insights';

  if (error) {
    return (
      <Card className="bg-destructive/10 border-destructive/20">
        <CardContent className="pt-6">
          <p className="text-destructive">Failed to load micro-learning content. Please refresh the page or try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl">Today's Learning</CardTitle>
            <Badge variant="outline" className="text-xs">
              Water Industry Insights
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : content ? (
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h2 className="text-xl font-semibold mb-4">{content.title}</h2>
            {content.content.split('\n\n').map((section, index) => (
              <p key={index} className="mb-4">{section}</p>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <p>No content available</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        )}
      </CardContent>

      {content && (
        <CardFooter className="flex flex-col gap-4">
          <ShareButtons url={shareUrl} title={shareTitle} description={shareText} />
          <div className="w-full flex justify-between items-center text-sm text-muted-foreground">
            <p>Updated hourly</p>
            <p className="font-medium">Powered by One Water Hub</p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}