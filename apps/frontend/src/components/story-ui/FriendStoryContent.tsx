import { isMediaStory, isTextStory, type FriendStory } from '@/interface/storyInterface';
import MediaStory from './MediaStory';
import Reactions from './Reactions';
import TextStory from './TextStory';
import { memo } from 'react';

interface Props {
  story: FriendStory;
  isPaused: boolean;
}

const StoryContent: React.FC<Props> = ({ story, isPaused }) => {
  console.log("render friend story")
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
      />
    </div>
  );
};

export default memo(StoryContent);