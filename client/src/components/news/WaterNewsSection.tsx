import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShareButtons } from '@/components/ui/ShareButtons';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Tag } from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  topics: string[];
}

export default function WaterNewsSection() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const { data: articles = [], isLoading } = useQuery<NewsArticle[]>({
    queryKey: ['/api/news', selectedTopic],
    // Refetch every hour
    refetchInterval: 1000 * 60 * 60,
    initialData: [
      {
        id: '1',
        title: 'New Water Infrastructure Bill Proposes $50B Investment',
        summary: 'A groundbreaking infrastructure bill focusing on modernizing water systems across major cities has been proposed, promising significant improvements in water quality and distribution efficiency.',
        source: 'Water Industry News',
        url: '#',
        publishedAt: new Date().toISOString(),
        topics: ['infrastructure', 'policy']
      },
      {
        id: '2',
        title: 'Climate Change Impact on Water Resources Study Released',
        summary: 'Recent research reveals concerning trends in water availability due to climate change, highlighting the need for adaptive management strategies.',
        source: 'Environmental Science Journal',
        url: '#',
        publishedAt: new Date().toISOString(),
        topics: ['climate change', 'research']
      },
      {
        id: '3',
        title: 'EPA Announces New Water Quality Standards',
        summary: 'The Environmental Protection Agency has unveiled updated regulations for water quality monitoring, introducing stricter guidelines for contaminant levels.',
        source: 'Regulatory Affairs',
        url: '#',
        publishedAt: new Date().toISOString(),
        topics: ['regulations', 'water quality']
      }
    ]
  });

  const topics = ['infrastructure', 'climate change', 'regulations', 'water quality', 'technology'];

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/50 dark:to-cyan-950/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Water Sector Updates</h2>
          <p className="text-muted-foreground text-lg mb-6">
            Stay informed with the latest developments in water management and sustainability
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {topics.map((topic) => (
              <Badge
                key={topic}
                variant={selectedTopic === topic ? 'default' : 'outline'}
                className="cursor-pointer text-sm px-3 py-1 capitalize"
                onClick={() => setSelectedTopic(selectedTopic === topic ? null : topic)}
              >
                <Tag className="w-3 h-3 mr-1" />
                {topic}
              </Badge>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {articles
              .filter(article => !selectedTopic || article.topics.includes(selectedTopic))
              .map((article) => (
                <Card 
                  key={article.id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur"
                >
                  <CardHeader className="pb-3">
                    <div className="flex gap-2 flex-wrap mb-2">
                      {article.topics.map((topic) => (
                        <Badge
                          key={topic}
                          variant="secondary"
                          className="text-xs capitalize"
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>
                    <CardTitle className="text-xl leading-tight">
                      <a 
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        {article.title}
                      </a>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {article.summary}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </div>
                      <ShareButtons 
                        url={article.url} 
                        title={article.title}
                        description={article.summary}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
