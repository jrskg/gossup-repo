import { useRef, useState } from "react";

interface Props {
  caption?: string
}

const StoryCaption: React.FC<Props> = ({
  caption
}) => {
  const [showCaption, setShowCaption] = useState(false);
  const captionTimeout = useRef<NodeJS.Timeout>();

  if (!caption) return null;

  const maxPreviewLength = 50;
  const truncatedCaption = caption.length > maxPreviewLength
    ? `${caption.substring(0, maxPreviewLength)}`
    : caption;

  const handleCaptionToggle = () => {
    setShowCaption(!showCaption);
    clearTimeout(captionTimeout.current);
    if (!showCaption) {
      captionTimeout.current = setTimeout(() => setShowCaption(false), 5000);
    }
  };

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-[90%]">
      <div className={`relative mb-4 transition-all duration-300 ${showCaption ? '-translate-y-6' : ''}`}>
        <button
          onClick={caption.length > truncatedCaption.length ? handleCaptionToggle : undefined}
          className={`w-full text-center p-3 rounded-lg backdrop-blur-lg transition-all ${showCaption
            ? 'bg-black/70 text-white shadow-lg'
            : 'bg-black/50 text-white/90 hover:bg-black/60'
            }`}
        >
          {showCaption ? (
            <div className="animate-fadeIn">
              {caption}
              <span className="block text-sm mt-2 text-white/70">Hide</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              {truncatedCaption}
              {caption.length > truncatedCaption.length && <span className="text-sm">▼</span>}
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default StoryCaption;