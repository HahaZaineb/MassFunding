import React from 'react';
import { Tooltip } from '@mui/material';
import { Share2 } from 'lucide-react';

interface TwitterShareButtonProps {
  title: string;
  description: string;
  url: string;
  hashtags?: string[];
}

const TwitterShareButton: React.FC<TwitterShareButtonProps> = ({
  title,
  description,
  url,
  hashtags = [],
}) => {
  const handleShare = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const text = encodeURIComponent(`${title}\n\n${description}`);
    const tweetUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(
      url,
    )}&hashtags=${hashtags.join(',')}`;
    window.open(tweetUrl, '_blank');
  };

  return (
    <>
      <Tooltip title={'Share on X'}>
        <button
          onClick={handleShare}
          data-tooltip-id="twitter-share-tooltip"
          className="flex justify-center items-center p-2 rounded-full bg-gray-100/20 hover:bg-gray-100/40 transition duration-200"
          aria-label="Share on Twitter"
        >
          <Share2 size={14} className="text-white" />
        </button>
      </Tooltip>
    </>
  );
};

export default TwitterShareButton;
