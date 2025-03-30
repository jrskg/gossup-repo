import { isMediaStory, isTextStory, type Story } from '@/interface/storyInterface';
import { useEffect, useRef } from 'react';

interface Props {
  story: Story;
  isPaused: boolean;
}
const StoryContent: React.FC<Props> = ({ story, isPaused }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!story) return;

    const mediaElement = story.type === 'video' ? videoRef.current : audioRef.current;
    if (!mediaElement) return;

    if (isPaused) {
      mediaElement.pause();
    } else {
      mediaElement.play().catch(() => { });
    }
  }, [isPaused, story]);

  if (isTextStory(story)) {
    const {
      backgroundColor,
      text,
      textColor,
      textFont
    } = story.content;
    return (
      <div
        className="w-full h-full flex items-center justify-center p-4 transition-colors duration-300"
        style={{
          backgroundColor: backgroundColor,
          color: textColor,
          fontFamily: textFont
        }}
      >
        <p className="text-4xl text-center">{text}</p>
      </div>
    );
  }
  else if (isMediaStory(story)) {
    const {
      mediaUrl,
      caption
    } = story.content
    switch (story.type) {
      case 'image':
        return (
          <img
            src={mediaUrl}
            alt={caption}
            className="w-full h-full object-cover"
          />
        );
      case 'video':
        return (
          <video
            ref={videoRef}
            src={mediaUrl}
            className="w-full h-full object-contain bg-black"
            autoPlay
            muted
            playsInline
          />
        );
      case 'audio':
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <audio
              ref={audioRef}
              src={mediaUrl}
              autoPlay
              controls
              className="w-full max-w-md"
            />
          </div>
        );
      default:
        return null;
    }
  }
};

export default StoryContent;