import CreateStoryModal from '@/components/story-ui/CreateStory';
import { StoryCard } from '@/components/story-ui/StoryCard';
import StoriesModal from '@/components/story-ui/StoryModal';
import { useAppSelector } from '@/hooks/hooks';
import { FriendStory, WhoseStory } from '@/interface/storyInterface';
import MainLayout from '@/layouts/MainLayout';
import { useState } from 'react';
import defaultAvatar from "../assets/defaultAvatar.jpg";
import { useLoadStoryWhenPageMounts } from '@/hooks/useStory';
import StoryPageSkeleton from '@/components/skeleton/StoryPageSkeleton';

const StoryPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [myStoryOpen, setMyStoryOpen] = useState(false);
  const [selectedFriendStory, setSelectedFriendStory] = useState<FriendStory[]>([]);
  const [globalIndex, setGlobalIndex] = useState(0);

  const { myStories, status, friendStoriesMap, orderedFriendIds } = useAppSelector(state => state.story);
  const { user } = useAppSelector(state => state.user);

  const { loading } = useLoadStoryWhenPageMounts(status);

  const handleOpenStoryModal = (stories: FriendStory[], index: number) => {
    setGlobalIndex(index);
    setSelectedFriendStory(stories);
    setIsOpen(true);
  }

  const onNextFriendStory = () => {
    if(globalIndex + 1 >= orderedFriendIds.length){
      setIsOpen(false);
      return;
    }
    const nextFriendId = orderedFriendIds[globalIndex + 1];
    const nextFriendStories = friendStoriesMap[nextFriendId];
    setGlobalIndex(prev => prev + 1);
    setSelectedFriendStory(nextFriendStories!);
  }

  const onPrevFriendStory = () => {
    if(globalIndex - 1 < 0){
      // setIsOpen(false);
      return;
    }
    const prevFriendId = orderedFriendIds[globalIndex - 1];
    const prevFriendStories = friendStoriesMap[prevFriendId];
    setGlobalIndex(prev => prev - 1);
    setSelectedFriendStory(prevFriendStories!);
  }

  if (loading) return <MainLayout>
    <section className='md:my-6 p-5 md:p-0 w-full md:w-[80%] lg:w-[60%] m-auto'>
      <StoryPageSkeleton />
    </section>
  </MainLayout>
  return (
    <MainLayout>
      <StoriesModal
        globalIndex={globalIndex}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        stories={selectedFriendStory}
        onNextFriend={onNextFriendStory}
        onPrevFriend={onPrevFriendStory}
        whose={WhoseStory.Friend}
      />

      {myStories.length > 0 && <StoriesModal
        globalIndex={0}
        isOpen={myStoryOpen}
        setIsOpen={setMyStoryOpen}
        stories={myStories}
        whose={WhoseStory.Mine}
      />}
      <section className='md:my-6 p-5 md:p-0 w-full md:w-[80%] lg:w-[60%] m-auto'>
        <h1 className='text-2xl font-bold'>Stories</h1>
        <div className='mt-4 flex gap-4 item-center'>
          <CreateStoryModal />
          {myStories.length > 0 && <StoryCard
            isMe={true}
            name={user?.name || ""}
            avatar={user?.profilePic?.avatar || ""}
            unseenStories={myStories.length}
            onView={() => setMyStoryOpen(true)}
          />}
        </div>

        <h1 className='text-2xl font-bold mt-6'>Friend's Stories</h1>
        <div className='mt-4 flex gap-4 item-center flex-wrap'>
          {
            orderedFriendIds.map((id, index) => {
              const stories = friendStoriesMap[id];
              const friend = stories[0].user;
              return <StoryCard
                avatar={friend.profilePic?.avatar || defaultAvatar}
                name={friend.name}
                unseenStories={stories.reduce((a, b) => {
                  if (b.hasViewed) return a;
                  return a + 1
                }, 0)}
                key={id}
                onView={() => handleOpenStoryModal(stories, index)}
              />
            })
          }
        </div>
      </section>
    </MainLayout>
  )
}

export default StoryPage