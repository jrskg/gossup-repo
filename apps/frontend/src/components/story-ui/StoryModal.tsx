import { FriendStory, isFriendStory, MyStory, WhoseStory } from "@/interface/storyInterface";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import FriendStoryContent from "./FriendStoryContent";
import MyStoryContent from "./MyStoryContent";
import StoryHeader from "./StoryHeader";
import { useAppSelector } from "@/hooks/hooks";

interface BaseProps {
  onNextFriend?: ((index: number) => void);
  onPrevFriend?: ((index: number) => void);
  globalIndex: number;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}
interface ForFriendProps extends BaseProps {
  whose: WhoseStory.Friend;
  stories: FriendStory[]
}

interface ForMineProps extends BaseProps {
  whose: WhoseStory.Mine;
  stories: MyStory[]
}

type Props = ForFriendProps | ForMineProps;
const StoriesModal: React.FC<Props> = ({
  stories,
  isOpen,
  setIsOpen,
  onNextFriend,
  globalIndex,
  whose,
  onPrevFriend
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [progress, setProgress] = useState(0);

  const currentStory = stories[currentIndex];

  const { user } = useAppSelector(state => state.user);
  const pausedTime = useRef<number>(0);
  const pausedDuration = useRef<number>(0);
  const startTime = useRef<number>(0);
  const rafId = useRef<number>();

  const storyOwner = useMemo(() => {
    if (!currentStory) return null;
    return isFriendStory(currentStory)
      ? {
        name: currentStory.user.name,
        avatar: currentStory.user.profilePic?.avatar,
        _id: currentStory.user._id
      }
      :
      {
        name: user?.name || "",
        avatar: user?.profilePic?.avatar,
        _id: user?._id || ""
      }
  }, [currentStory, user]);

  useEffect(() => {
    if (isOpen) setIsPaused(false);
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
      else handleClose();
    }
  };

  function handlePrev() {
    startTime.current = 0;
    pausedDuration.current = 0;
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    } else {
      if (onPrevFriend && typeof onPrevFriend === "function") onPrevFriend(globalIndex);
    }
  };

  const handleClose = useCallback(() => { //todo fix the header rendering
    setIsOpen(false);
    setCurrentIndex(0);
    setProgress(0);
    setIsPaused(true);
    pausedTime.current = 0;
    pausedDuration.current = 0;
    startTime.current = 0;
  }, [])

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleClose}
    >
      <DialogContent className="p-0 border-none max-w-xl w-full top-[47%] md:top-[47%] bg-transparent [&>button]:hidden">
        <VisuallyHidden>
          <DialogTitle>Stories</DialogTitle>
          <DialogDescription>Stories Description</DialogDescription>
        </VisuallyHidden>
        <div className="relative backdrop-blur-sm transition-opacity z-10 rounded-sm">
          <div className="flex gap-1 z-20 my-2 px-1 mt-2 md:mt-0">
            {stories.map((story, index) => (
              <div
                key={story._id}
                className="h-1 bg-gray-500 dark:bg-gray-700 flex-1 rounded-full overflow-hidden relative"
              >
                <div
                  className="h-full bg-primary-1 absolute top-0 left-0"
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

          {currentStory && <StoryHeader
            createdAt={currentStory.createdAt}
            whose={whose}
            storyId={currentStory._id}
            onClose={handleClose}
            storyOwner={storyOwner!}
          />}

          <div className="relative md:min-h-[700px] md:max-h-[700px] w-full h-[85vh] md:h-full mb-2 md:mb-0">
            {
              (() => {
                switch (whose) {
                  case WhoseStory.Friend:
                    return <FriendStoryContent story={currentStory as FriendStory} isPaused={isPaused} />
                  case WhoseStory.Mine:
                    return <MyStoryContent story={currentStory as MyStory} isPaused={isPaused} />
                }
              })()
            }
          </div>

          <div className="absolute w-full h-[65%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 grid grid-cols-[30%_40%_30%] z-10">
            <button onClick={handlePrev} />
            <button
              onMouseDown={handlePlayPause}
              onMouseUp={handlePlayPause}
              onTouchStart={handlePlayPause}
              onTouchEnd={handlePlayPause}
            />
            <button onClick={handleNext} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StoriesModal;