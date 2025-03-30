import { StoryCard } from '@/components/story-ui/StoryCard';
import StoriesModal from '@/components/story-ui/StoryModal';
import { useAppSelector } from '@/hooks/hooks';
import { Story } from '@/interface/storyInterface';
import MainLayout from '@/layouts/MainLayout';
import { Plus } from 'lucide-react';
import defaultAvatar from "../assets/defaultAvatar.jpg";
import { useState } from 'react';


const uniqueOrderedFIds = [
  "67d164e1b145303ffabd27b8",
  "66f9266fad32476d34c2ad5b",
  "670f9d8ce8fe4f0a398bf093",
  "670fa3ea9b1992f78f063994",
  "670fa3ea9b1992f78f063995",
  "670fa3ea9b1992f78f06399b",
]
const stories: Story[] = [
  {
    _id: "67e3d32425b94908a1451e42",
    userId: "67d164e1b145303ffabd27b8",
    type: "text",
    content: {
      text: "This is my story new",
      textColor: "#fff",
      textFont: "ubuntu",
      backgroundColor: "#ff0040",
      duration: 20
    },
    visibility: "all",
    allowedUsers: [],
    excludedUsers: [],
    expireAt: "2025-03-27T10:12:52.321Z",
    createdAt: "2025-03-26T10:12:52.328Z",
    updatedAt: "2025-03-26T10:12:52.328Z",
    hasViewed: true,
    reactions: [
      [
        "love",
        "love",
        "love"
      ]
    ]
  },
  {
    _id: "67e3d3c325b94908a1451e45",
    userId: "67d164e1b145303ffabd27b8",
    type: "image",
    content: {
      caption: "I just love this guy",
      mediaUrl: "https://i.pinimg.com/736x/70/b1/ec/70b1ec9356a859100debef06b4bb4623.jpg",
      duration: 20
    },
    visibility: "all",
    allowedUsers: [],
    excludedUsers: [],
    expireAt: "2025-03-27T10:15:31.557Z",
    createdAt: "2025-03-26T10:15:31.558Z",
    updatedAt: "2025-03-26T10:15:31.558Z",
    hasViewed: false,
    reactions: []
  }
]

const myStories = [
  {
    _id: "67e3d32425b94908a1451e42",
    userId: "67d7cca24e59c13d6979094d",
    type: "text",
    content: {
      text: "This is my story new",
      textColor: "#fff",
      textFont: "ubuntu",
      backgroundColor: "#ff0040",
      duration: 20
    },
    visibility: "all",
    allowedUsers: [],
    excludedUsers: [],
    createdAt: "2025-03-26T10:12:52.328Z",
    updatedAt: "2025-03-26T10:12:52.328Z",
    views: [
      {
        _id: "67e3dbc3cee670d15cba9417",
        storyId: "67e3d32425b94908a1451e42",
        viewedBy: "67d164e1b145303ffabd27b8",
        __v: 1,
        createdAt: "2025-03-26T10:49:39.060Z",
        reactions: [
          "love",
          "love",
          "love"
        ],
        updatedAt: "2025-03-26T10:49:39.131Z"
      }
    ]
  },
  {
    _id: "67e3d3c325b94908a1451e45",
    userId: "67d7cca24e59c13d6979094d",
    type: "image",
    content: {
      caption: "I just love this guy",
      mediaUrl: "https://i.pinimg.com/736x/70/b1/ec/70b1ec9356a859100debef06b4bb4623.jpg",
      duration: 20
    },
    visibility: "all",
    allowedUsers: [],
    excludedUsers: [],
    createdAt: "2025-03-26T10:15:31.558Z",
    updatedAt: "2025-03-26T10:15:31.558Z",
    views: []
  }
]

const StoryPage = () => {
  const [isOpen, setIsOpen] = useState(false);

  const {participants} = useAppSelector(state => state.chats);
  const { user } = useAppSelector(state => state.user);
  return (
    <MainLayout>
      <StoriesModal
        globalIndex={0}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        stories={stories}
        onNextFriend={null}
      />
      <section className='md:my-6 p-5 md:p-0 w-full md:w-[80%] lg:w-[60%] m-auto'>
        <h1 className='text-2xl font-bold'>Stories</h1>
        <div className='mt-4 flex gap-4 item-center'>
          <div className="text-center w-min">
            <div className="w-32 h-32 rounded-full dark:bg-gray-800 bg-primary-4 flex items-center justify-center cursor-pointer hover:dark:bg-gray-700 hover:bg-primary-3 transition-colors">
              <Plus className="w-12 h-12" />
            </div>
            <p className="mt-2 text-sm">Create Story</p>
          </div>
          <StoryCard
            isMe={true}
            name={user?.name || ""}
            avatar={user?.profilePic?.avatar || ""}
            unseenStories={myStories.length}
            onView={() => {}}
          />
        </div>

        <h1 className='text-2xl font-bold mt-6'>Friend's Stories</h1>
        <div className='mt-4 flex gap-4 item-center flex-wrap'>
          {
            uniqueOrderedFIds.map(id => {
              const friend = participants[id];
              return <StoryCard
                avatar={friend.profilePic?.avatar || defaultAvatar}
                name={friend.name}
                unseenStories={stories.reduce((a, b) => {
                  if(b.hasViewed) return a;
                  return a + 1
                }, 0)}
                key={id}
                onView={() => setIsOpen(true)}
              />
            })
          }
        </div>
      </section>
    </MainLayout>
  )
}

export default StoryPage