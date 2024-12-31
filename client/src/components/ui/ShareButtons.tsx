import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  FacebookIcon,
  LinkedinIcon,
  TwitterIcon,
} from 'react-share';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
}

export function ShareButtons({ url, title, description }: ShareButtonsProps) {
  return (
    <div className="flex gap-3 items-center py-2">
      <FacebookShareButton url={url} hashtag="#OneWaterAI">
        <FacebookIcon size={32} round />
      </FacebookShareButton>

      <LinkedinShareButton 
        url={url} 
        title={title} 
        summary={description}
        source="One Water.AI"
      >
        <LinkedinIcon size={32} round />
      </LinkedinShareButton>

      <TwitterShareButton url={url} title={title}>
        <TwitterIcon size={32} round />
      </TwitterShareButton>
    </div>
  );
}