import { MediaContent, StoryType } from '@/interface/storyInterface';
import React, { useEffect, useRef } from 'react';
import StoryCaption from './StoryCaption';
import AudioAnimation from './AudioAnimation';

interface Props {
  content: MediaContent;
  isPaused: boolean;
  type: StoryType
}

const MediaStory: React.FC<Props> = ({ content, isPaused, type }) => {
  const { mediaUrl, caption } = content;

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const mediaElement = type === 'video' ? videoRef.current : audioRef.current;
    if (!mediaElement) return;

    isPaused ? mediaElement.pause() : mediaElement.play().catch(() => { });
  }, [isPaused, type]);


  const renderMediaContent = () => {
    switch (type) {
      case 'image':
        return (
          <img
            src={mediaUrl}
            alt="story"
            className="w-full h-full object-cover object-center rounded-md"
          />
        );
      case 'video':
        return (
          <video
            ref={videoRef}
            src={mediaUrl}
            className="w-full h-full object-contain"
            autoPlay
            playsInline
          />
        );
      case 'audio':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/80 to-blue-900/80 rounded-md">
            <AudioAnimation isPaused={isPaused} />
            <audio ref={audioRef} controls={false} src={mediaUrl} autoPlay className="w-0 h-0" />
          </div>
        );
      default:
        return null;
    }
  };
  return (
    <>
      {renderMediaContent()}
      <StoryCaption caption={caption} />
    </>
  )
}

export default MediaStory