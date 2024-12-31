import { Button } from '@/components/ui/button';
import { Twitter, Facebook, Linkedin } from 'lucide-react';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
}

export function ShareButtons({ url, title, description }: ShareButtonsProps) {
  const handleShare = (platform: 'twitter' | 'facebook' | 'linkedin') => {
    const text = description || title;
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}&title=${encodeURIComponent(title)}`;
        break;
    }

    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex gap-3 items-center py-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => handleShare('twitter')}
        className="flex items-center gap-2"
      >
        <Twitter className="h-4 w-4" />
        Share on Twitter
      </Button>

      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => handleShare('linkedin')}
        className="flex items-center gap-2"
      >
        <Linkedin className="h-4 w-4" />
        Share on LinkedIn
      </Button>

      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => handleShare('facebook')}
        className="flex items-center gap-2"
      >
        <Facebook className="h-4 w-4" />
        Share on Facebook
      </Button>
    </div>
  );
}