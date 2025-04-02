import { isMediaStory, isTextStory, type Story } from '@/interface/storyInterface';
import { useEffect, useRef } from 'react';
import StoryCaption from './StoryCaption';
import Reactions from './Reactions';

interface Props {
  story: Story;
  isPaused: boolean;
}

const StoryContent: React.FC<Props> = ({ story, isPaused }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const mediaElement = story.type === 'video' ? videoRef.current : audioRef.current;
    if (!mediaElement) return;

    isPaused ? mediaElement.pause() : mediaElement.play().catch(() => { });
  }, [isPaused, story]);

  if (isTextStory(story)) {
    return (
      <div
        className="relative w-full h-full flex items-center justify-center p-4 rounded-md"
        style={{
          backgroundColor: story.content.backgroundColor,
          color: story.content.textColor,
          fontFamily: story.content.textFont,
          boxShadow: `0 20px 40px rgba(0,0,0,0.15)`,
        }}
      >
        <p className="text-4xl text-center transform transition-transform duration-300 hover:scale-105">
          {story.content.text}
        </p>
        <Reactions
          storyId={story._id}
        />
      </div>
    );
  }

  const renderMediaContent = () => {
    if (!isMediaStory(story)) return null;

    const { mediaUrl } = story.content;

    switch (story.type) {
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
            <div className="relative w-40 h-40 flex items-center justify-center">
              <div className="absolute inset-0 bg-white/10 rounded-full backdrop-blur-xl shadow-2xl" />
              <div className={`flex gap-1.5 ${!isPaused ? 'animate-pulse' : ''}`}>
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className="w-3 h-12 bg-gradient-to-t from-cyan-400 to-blue-600 rounded-full"
                    style={{
                      animation: `bounce 1.2s infinite ${i * 0.1}s`,
                      animationPlayState: isPaused ? 'paused' : 'running',
                    }}
                  />
                ))}
              </div>
            </div>
            <audio ref={audioRef} src={mediaUrl} autoPlay className="w-0 h-0" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full">
      {renderMediaContent()}

      {isMediaStory(story) && (
        <StoryCaption caption={story.content.caption} />
      )}

      <Reactions
        storyId={story._id}
      />
    </div>
  );
};

export default StoryContent;