import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShareButtons } from '@/components/ui/ShareButtons';
import { Newspaper, Calendar, Tag } from 'lucide-react';

interface NewsItem {
  title: string;
  summary: string;
  url: string;
  category: string;
  timestamp: string;
  relevanceScore: number;
}

interface NewsCardProps {
  news: NewsItem;
  index: number;
}

export function NewsCard({ news, index }: NewsCardProps) {
  const shareUrl = news.url;
  const shareTitle = `📰 Interesting water sector news: ${news.title}`;
  const shareDescription = news.summary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="hover:shadow-scale-hover transition-shadow duration-200">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">{news.title}</CardTitle>
            </div>
            <ShareButtons
              url={shareUrl}
              title={shareTitle}
              description={shareDescription}
            />
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(news.timestamp).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Tag className="h-4 w-4" />
              <span>{news.category}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {news.summary}
          </p>
          <motion.a
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-sm font-medium text-blue-500 hover:text-blue-600"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Read more →
          </motion.a>
        </CardContent>
      </Card>
    </motion.div>
  );
}
