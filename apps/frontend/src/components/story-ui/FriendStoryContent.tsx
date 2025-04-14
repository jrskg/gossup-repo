import { useAppDispatch } from '@/hooks/hooks';
import { isMediaStory, isTextStory, type FriendStory } from '@/interface/storyInterface';
import { updateStoryViewAndReaction } from '@/redux/slices/story';
import instance from '@/utils/axiosInstance';
import { AxiosError } from 'axios';
import { memo, useEffect } from 'react';
import { toast } from 'sonner';
import MediaStory from './MediaStory';
import Reactions from './Reactions';
import TextStory from './TextStory';

interface Props {
  story: FriendStory;
  isPaused: boolean;
}

const FriendStoryContent: React.FC<Props> = ({ story, isPaused }) => {
  console.log("render friend story");
  const dispatch = useAppDispatch();

  useEffect(() => {
    (async () => {
      if(!story.hasViewed){
        try {
          await instance.put(`/story/${story._id}`);
          dispatch(updateStoryViewAndReaction({friendId: story.user._id, storyId: story._id}));
        } catch (error) {
          if(error instanceof AxiosError && error.response){
            toast.error(error.response.data.message);
            console.log(error);
          }
        }
      }
    })();
  }, [story]);
  
  return (
    <div className="relative w-full h-full">
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
      <Reactions
        storyId={story._id}
        friendId={story.user._id}
      />
    </div>
  );
};

export default memo(FriendStoryContent);