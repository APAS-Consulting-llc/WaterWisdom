import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, ArrowLeft, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { ShareButtons } from '@/components/ui/ShareButtons';
import { motion, AnimatePresence } from 'framer-motion';

interface MicroLearningContent {
  title: string;
  content: string;
  author: string;
  topic: string;
  timestamp: string;
}

const knowledgeBase: MicroLearningContent[] = [
  {
    title: "AI Revolution in Water Management",
    content: `Artificial Intelligence is transforming how we approach water management challenges. Machine learning algorithms are now capable of predicting water quality issues before they occur, optimizing treatment processes, and managing distribution networks with unprecedented efficiency. 

The real power lies in AI's ability to process vast amounts of sensor data in real-time, making water operations more proactive rather than reactive. This shift represents a fundamental change in how we manage our water resources.

Key applications include predictive maintenance, demand forecasting, and water quality monitoring, all contributing to more sustainable and efficient water management practices.`,
    author: "Hardeep Anand",
    topic: "Artificial Intelligence",
    timestamp: new Date().toISOString()
  },
  {
    title: "Knowledge Fragmentation in Water Sector",
    content: `One of the biggest challenges facing the water sector today is the fragmentation of knowledge and data. Critical information exists in silos across utilities, research institutions, and government agencies, making it difficult to leverage collective wisdom for solving complex water challenges.

This fragmentation leads to duplicated efforts, missed opportunities for innovation, and slower response times to emerging water issues. We need to build better bridges between these knowledge islands and create more integrated platforms for sharing insights and best practices.

The solution lies in creating unified knowledge platforms and fostering a culture of open collaboration while respecting data privacy and security concerns.`,
    author: "Hardeep Anand",
    topic: "Data Fragmentation",
    timestamp: new Date().toISOString()
  },
  {
    title: "Water Sector Governance: A Modern Approach",
    content: `Effective water governance requires a delicate balance between various stakeholders, regulatory frameworks, and operational needs. Modern water sector governance must evolve to address emerging challenges like climate change, urbanization, and increasing water stress.

Key principles for successful governance include:
- Transparent decision-making processes
- Inclusive stakeholder engagement
- Evidence-based policy making
- Adaptive management approaches

We need to move towards more integrated governance models that can respond quickly to changing conditions while maintaining long-term sustainability goals.`,
    author: "Hardeep Anand",
    topic: "Governance",
    timestamp: new Date().toISOString()
  }
];

export default function MicroLearning() {
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: content, isLoading, error } = useQuery<MicroLearningContent[]>({
    queryKey: ['/api/micro-learning', refreshKey],
    initialData: knowledgeBase,
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

  const nextContent = () => {
    setCurrentIndex((prev) => (prev + 1) % (content?.length || 1));
  };

  const previousContent = () => {
    setCurrentIndex((prev) => (prev - 1 + (content?.length || 1)) % (content?.length || 1));
  };

  const currentContent = content?.[currentIndex];
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = currentContent ? 
    `${currentContent.title}\n\nPowered by One Water Hub` : 
    'Check out this water industry insight from One Water Hub';
  const shareTitle = currentContent?.title || 'Water Industry Insights';

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
              {currentContent?.topic || 'Water Industry Insights'}
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
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : currentContent ? (
            <motion.div
              key={currentContent.title}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="prose prose-slate dark:prose-invert max-w-none"
            >
              <h2 className="text-xl font-semibold mb-4">{currentContent.title}</h2>
              {currentContent.content.split('\n\n').map((section, index) => (
                <p key={index} className="mb-4">{section}</p>
              ))}
              <div className="flex items-center justify-end gap-2 mt-4 text-sm text-muted-foreground">
                <span>By {currentContent.author}</span>
              </div>
            </motion.div>
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
        </AnimatePresence>
      </CardContent>

      {currentContent && (
        <CardFooter className="flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={previousContent}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            <ShareButtons url={shareUrl} title={shareTitle} description={shareText} />
            <Button
              variant="ghost"
              size="sm"
              onClick={nextContent}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="w-full flex justify-between items-center text-sm text-muted-foreground">
            <p>Updated hourly</p>
            <p className="font-medium">Powered by One Water Hub</p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}