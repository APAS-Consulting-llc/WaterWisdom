import { useNews } from '@/hooks/use-news';
import { NewsCard } from './NewsCard';
import { Loader2, Newspaper } from 'lucide-react';

export function NewsFeed() {
  const { data: news, isLoading, error } = useNews();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load news</p>
      </div>
    );
  }

  if (!news?.length) {
    return (
      <div className="text-center py-12">
        <Newspaper className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">No news articles available at the moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {news.map((item, index) => (
        <NewsCard key={item.url} news={item} index={index} />
      ))}
    </div>
  );
}
