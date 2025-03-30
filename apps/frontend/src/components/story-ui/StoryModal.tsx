import { Story } from "@/interface/storyInterface";
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import StoryContent from "./StoryContent";

interface Props {
  stories: Story[];
  onNextFriend: ((index: number) => void) | null;
  globalIndex: number;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}
const StoriesModal: React.FC<Props> = ({ stories, isOpen, setIsOpen, onNextFriend, globalIndex }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [progress, setProgress] = useState(0);

  const currentStory = stories[currentIndex];

  const pausedTime = useRef<number>(0);
  const pausedDuration = useRef<number>(0);
  const startTime = useRef<number>(0);
  const rafId = useRef<number>();

  useEffect(() => {
    if(isOpen) setIsPaused(false);
  }, [isOpen]);

  useEffect(() => {
    if (!currentStory || isPaused) return;

    const duration = currentStory.content.duration * 1000;

    const animate = (timestamp: number) => {
      if (!startTime.current) {
        startTime.current = timestamp;
      }

      const elapsed = timestamp - startTime.current - pausedDuration.current;
      const newProgress = (elapsed / duration) * 100;

      if (newProgress >= 100) {
        handleNext();
      } else {
        setProgress(newProgress);
        rafId.current = requestAnimationFrame(animate);
      }
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [currentIndex, isPaused, currentStory, handleNext]);

  function handlePlayPause() {
    if (isPaused) {
      pausedDuration.current += Date.now() - pausedTime.current;
      setIsPaused(false);
    } else {
      pausedTime.current = Date.now();
      setIsPaused(true);
    }
  }

  function handleNext() {
    startTime.current = 0;
    pausedDuration.current = 0;
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      if (onNextFriend && typeof onNextFriend === "function") onNextFriend(globalIndex);
      else setIsOpen(false);
    }
  };

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogContent className="bg-blue-500 border-none w-[60%]">
        <div className="relative bg-black/90 backdrop-blur-sm transition-opacity z-50">
          <div className="absolute top-4 left-4 right-4 flex gap-1 z-50">
            {stories.map((story, index) => (
              <div
                key={story._id}
                className="h-1 bg-gray-800/50 flex-1 rounded-full overflow-hidden relative"
              >
                <div
                  className="h-full bg-white/80 absolute top-0 left-0"
                  style={{
                    width:
                      index < currentIndex
                        ? '100%'
                        : index === currentIndex
                          ? `${progress}%`
                          : '0%'
                  }}
                />
              </div>
            ))}
          </div>

          <div className="relative min-h-[600px] w-full h-full">
            <StoryContent story={currentStory} isPaused={isPaused} />
          </div>

          <div className="absolute inset-0 flex justify-between items-center z-50">
            <button
              onClick={handlePrev}
              className="h-full w-1/3 flex items-center justify-start pl-4 opacity-0 hover:opacity-100 transition-opacity"
            >
              <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm">
                <ChevronLeft className="h-8 w-8 text-white/80" />
              </div>
            </button>

            <button
              onClick={handleNext}
              className="h-full w-1/3 flex items-center justify-end pr-4 opacity-0 hover:opacity-100 transition-opacity"
            >
              <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm">
                <ChevronRight className="h-8 w-8 text-white/80" />
              </div>
            </button>
          </div>

          <div className="absolute bottom-4 left-4 z-50">
            <button
              onClick={handlePlayPause}
              className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white/80 hover:text-white transition-colors"
            >
              {isPaused ? (
                <Play className="h-6 w-6" />
              ) : (
                <Pause className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StoriesModal;