import { isMediaStory, isTextStory, MyStory } from '@/interface/storyInterface';
import { cn } from '@/lib/utils';
import { Eye, X } from 'lucide-react';
import React, { memo, useState } from 'react';
import MediaStory from './MediaStory';
import TextStory from './TextStory';
import StoryViewCard from './StoryViewCard';
import { toast } from 'sonner';

interface Props {
  story: MyStory;
  isPaused: boolean;
}

const MyStoryContent: React.FC<Props> = ({ isPaused, story }) => {
  const [isViewsVisible, setIsViewsVisible] = useState(false);
  const [showViews, setShowViews] = useState(false);

  console.log("render my story")

  const handleVisibility = () => {
    if(story.views.length === 0){
      toast.info("No views yet");
      return;
    }  
    setIsViewsVisible(prev => {
      if (prev) setShowViews(false);
      // handlePause();
      return !prev;
    })
  }

  const handleTransitionEnd = () => {
    if (isViewsVisible) setShowViews(true);
  }
  return (
    <div className="relative w-full h-full flex flex-col items-center">
      {isTextStory(story) &&
        <TextStory
          content={story.content}
        />
      }

      {isMediaStory(story) &&
        <MediaStory
          isPaused={isPaused}
          content={story.content}
          type={story.type}
        />
      }
      <div className="absolute bottom-2 flex items-center gap-1.5 bg-primary-1 dark:bg-dark-2 px-2 py-1 rounded-lg">
        <span className="text-sm">
          {story.views.length || 0}
        </span>
        <button
          onClick={handleVisibility}
          className="p-1 hover:text-primary-600 transition-colors"
        >
          {isViewsVisible ? (
            <X className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
      <div
        className={cn(
          'absolute w-[90%] bottom-10 m-auto z-30 transition-all duration-300 rounded-md overflow-y-scroll shadow-lg bg-primary-4 dark:bg-dark-2',
          isViewsVisible ? "h-[90%]" : "h-0"
        )}
        onTransitionEnd={handleTransitionEnd}
      >
        {
          showViews && <div className='p-5 flex flex-col gap-2'>
            {
              story.views.map(view => (
                <StoryViewCard
                  key={view._id}
                  createdAt={view.createdAt}
                  viewedBy={view.viewedBy}
                  reactions={view.reactions}
                />
              ))
            }
          </div>
        }
      </div>
    </div>
  )
}

export default memo(MyStoryContent);