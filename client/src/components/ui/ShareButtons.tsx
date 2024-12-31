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
    <div className="flex gap-3 items-center justify-center py-2">
      <FacebookShareButton url={url} title={title}>
        <FacebookIcon size={40} round />
      </FacebookShareButton>

      <LinkedinShareButton 
        url={url} 
        title={title} 
        summary={description}
        source="Water.AI"
      >
        <LinkedinIcon size={40} round />
      </LinkedinShareButton>

      <TwitterShareButton url={url} title={title}>
        <TwitterIcon size={40} round />
      </TwitterShareButton>
    </div>
  );
}