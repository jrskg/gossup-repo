import { Story } from "@/interface/storyInterface";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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

  // useEffect(() => {
  //   if(isOpen) setIsPaused(false);
  // }, [isOpen]);

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
      else handleClose();
    }
  };

  function handlePrev() {
    startTime.current = 0;
    pausedDuration.current = 0;
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  function handleClose() {
    setIsOpen(false);
    setCurrentIndex(0);
    setProgress(0);
    setIsPaused(true);
    pausedTime.current = 0;
    pausedDuration.current = 0;
    startTime.current = 0;
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleClose}
    >
      <DialogContent className="p-0 border-none max-w-xl w-full top-[45%]">
        <VisuallyHidden>
          <DialogTitle>Stories</DialogTitle>
          <DialogDescription>Stories Description</DialogDescription>
        </VisuallyHidden>
        <div className="relative bg-black/90 backdrop-blur-sm transition-opacity z-50 rounded-sm">
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

          <div className="relative min-h-[700px] md:max-h-[700px] w-full h-[90vh] md:h-full">
            <StoryContent story={currentStory} isPaused={isPaused} />
          </div>

          <div className="absolute w-full h-[65%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 grid grid-cols-[30%_40%_30%]">
            <p onClick={handlePrev}/>
            <p 
              onMouseDown={handlePlayPause}
              onMouseUp={handlePlayPause}
              onTouchStart={handlePlayPause}
              onTouchEnd={handlePlayPause}
            />
            <p onClick={handleNext}/>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StoriesModal;