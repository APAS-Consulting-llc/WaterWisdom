import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Twitter, Facebook, Linkedin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TwitterShareButton,
  FacebookShareButton,
  LinkedinShareButton,
} from 'react-share';

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

  const shareUrl = window.location.href;
  const shareText = content ? `${content.substring(0, 200)}... \n\nPowered by WaterWisdom.AI` : '';
  const shareTitle = 'Water Industry Insights';

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
                  Water Industry Insights
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
              </div>
            </div>
            {/* Social Share Buttons */}
            <div className="flex gap-2 mt-4">
              <TwitterShareButton url={shareUrl} title={shareText}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Twitter className="h-4 w-4" />
                  Share on Twitter
                </Button>
              </TwitterShareButton>
              <LinkedinShareButton url={shareUrl} title={shareTitle} summary={shareText}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Linkedin className="h-4 w-4" />
                  Share on LinkedIn
                </Button>
              </LinkedinShareButton>
              <FacebookShareButton url={shareUrl} quote={shareText}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Facebook className="h-4 w-4" />
                  Share on Facebook
                </Button>
              </FacebookShareButton>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="prose prose-slate dark:prose-invert max-w-none">
                {content?.split('\n\n').map((section, index) => {
                  if (section.startsWith('Title:')) {
                    return <h2 key={index} className="text-2xl font-bold mb-4">{section.replace('Title:', '').trim()}</h2>;
                  }
                  if (section.startsWith('Key Concepts:')) {
                    return (
                      <div key={index} className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Key Concepts</h3>
                        <ul className="list-none pl-0">
                          {section.replace('Key Concepts:', '')
                            .split('•')
                            .filter(item => item.trim())
                            .map((item, i) => (
                              <li key={i} className="flex items-center gap-2 mb-2">
                                <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                                {item.trim()}
                              </li>
                            ))}
                        </ul>
                      </div>
                    );
                  }
                  if (section.startsWith('Recent Developments:')) {
                    return (
                      <div key={index} className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Recent Developments</h3>
                        <p>{section.replace('Recent Developments:', '').trim()}</p>
                      </div>
                    );
                  }
                  if (section.startsWith('Practical Applications:')) {
                    return (
                      <div key={index} className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Practical Applications</h3>
                        <p>{section.replace('Practical Applications:', '').trim()}</p>
                      </div>
                    );
                  }
                  if (section.startsWith('Reflection Question:')) {
                    return (
                      <div key={index} className="mb-6 bg-primary/5 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Reflection Question</h3>
                        <p className="italic">{section.replace('Reflection Question:', '').trim()}</p>
                      </div>
                    );
                  }
                  return <p key={index} className="mb-4">{section}</p>;
                })}
              </div>
            )}
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground flex justify-between items-center">
            <p>Updated hourly</p>
            <p className="font-medium">Powered by WaterWisdom.AI</p>
          </CardFooter>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}