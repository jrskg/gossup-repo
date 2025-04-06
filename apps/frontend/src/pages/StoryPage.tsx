import { StoryCard } from '@/components/story-ui/StoryCard';
import StoriesModal from '@/components/story-ui/StoryModal';
import { useAppSelector } from '@/hooks/hooks';
import { FriendStory, MyStory, WhoseStory } from '@/interface/storyInterface';
import MainLayout from '@/layouts/MainLayout';
import { Plus } from 'lucide-react';
import defaultAvatar from "../assets/defaultAvatar.jpg";
import { useState } from 'react';
import CreateStoryModal from '@/components/story-ui/CreateStory';


const uniqueOrderedFIds = [
  "67d164e1b145303ffabd27b8",
  "66f9266fad32476d34c2ad5b",
  "670f9d8ce8fe4f0a398bf093",
  "670fa3ea9b1992f78f063994",
  "670fa3ea9b1992f78f063995",
  "670fa3ea9b1992f78f06399b",
]
const stories: FriendStory[] = [
  {
    _id: "67e3d32425b94908a1451e42",
    userId: "67d164e1b145303ffabd27b8",
    type: "text",
    content: {
      text: "This is my new story, with a long text and a great background.This feels quite complicated and homogenized, but it's actually a very simple and simple text.",
      textColor: "#fff",
      textFont: "cursive",
      backgroundColor: "#ff0789",
      duration: 10
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
        "love",
        "haha"
      ]
    ]
  },
  {
    _id: "67e3d3c325b94908a1451e45",
    userId: "67d164e1b145303ffabd27b8",
    type: "image",
    content: {
      caption: "Hritik Roshan seems to be a great dancer.",
      mediaUrl: "https://i.pinimg.com/736x/70/b1/ec/70b1ec9356a859100debef06b4bb4623.jpg",
      duration: 20
    },
    visibility: "all",
    allowedUsers: [],
    excludedUsers: [],
    expireAt: "2025-03-27T10:15:31.557Z",
    createdAt: "2025-03-26T10:15:31.558Z",
    updatedAt: "2025-03-26T10:15:31.558Z",
    hasViewed: true,
    reactions: [
      [
        "angry",
        "like",
        "wow"
      ]
    ]
  },
  {
    _id: "67e3d3c325b94908a1451e12",
    userId: "67d164e1b145303ffabd27b8",
    type: "audio",
    content: {
      caption: "This video is quite good for health",
      mediaUrl: "https://res.cloudinary.com/dg2jnf6ns/video/upload/v1730704151/chat_assests/nfnclz1k29wdkteqkhhl.mp4",
      duration: 20
    },
    visibility: "all",
    allowedUsers: [],
    excludedUsers: [],
    expireAt: "2025-03-27T10:15:31.557Z",
    createdAt: "2025-03-26T10:15:31.558Z",
    updatedAt: "2025-03-26T10:15:31.558Z",
    hasViewed: false,
    reactions: [
      [
        "love",
        "sad",
        "sad",
        "sad"
      ]
    ]
  },
  {
    _id: "67e3d3c325b94908a1451e098",
    userId: "67d164e1b145303ffabd27b8",
    type: "video",
    content: {
      caption: "I just love this guy a big caption haha nice to have you",
      mediaUrl: "https://res.cloudinary.com/dg2jnf6ns/video/upload/v1730704160/chat_assests/sxik9ctag3bdfzu6izo5.mp4",
      duration: 20
    },
    visibility: "all",
    allowedUsers: [],
    excludedUsers: [],
    expireAt: "2025-03-27T10:15:31.557Z",
    createdAt: "2025-03-26T10:15:31.558Z",
    updatedAt: "2025-03-26T10:15:31.558Z",
    hasViewed: false,
    reactions: [
      ["angry", "care", "like"]
    ]
  },
  {
    _id: "67e3d3c325b94908a1451e0jh",
    userId: "67d164e1b145303ffabd27b8",
    type: "video",
    content: {
      caption: "This is my latest video on my tiktok account",
      mediaUrl: "https://res.cloudinary.com/dg2jnf6ns/video/upload/v1730704154/chat_assests/mwnrbjtz19ixsnyhmxvx.mp4",
      duration: 20
    },
    visibility: "all",
    allowedUsers: [],
    excludedUsers: [],
    expireAt: "2025-03-27T10:15:31.557Z",
    createdAt: "2025-03-26T10:15:31.558Z",
    updatedAt: "2025-03-26T10:15:31.558Z",
    hasViewed: false,
    reactions: [
      [
        "love",
        "care",
        "love"
      ]
    ]
  }
]

const myStories: MyStory[] = [
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
    expireAt:"dfghjk",
    views: [
      {
        _id: "dfghjkkerty",
        viewedBy: {
          _id:"fghjk",
          name:"Random Name",
          profilePic:{
            avatar:"https://res.cloudinary.com/dg2jnf6ns/image/upload/c_fit,h_100,q_auto:low,w_100/v1/gossup_profile/66f9266fad32476d34c2ad5b_jx3uph?_a=BAMAGSa40",
            image:"ghj",
            publicId:"hj"
          }
        },
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
    expireAt:"fghjk",
    views: []
  }
]

const StoryPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [myStoryOpen, setMyStoryOpen] = useState(false);

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
        whose={WhoseStory.Friend}
      />

      <StoriesModal
        globalIndex={0}
        isOpen={myStoryOpen}
        setIsOpen={setMyStoryOpen}
        stories={myStories}
        whose={WhoseStory.Mine}
        onNextFriend={null}
      />
      <section className='md:my-6 p-5 md:p-0 w-full md:w-[80%] lg:w-[60%] m-auto'>
        <h1 className='text-2xl font-bold'>Stories</h1>
        <div className='mt-4 flex gap-4 item-center'>
          <CreateStoryModal/>
          <StoryCard
            isMe={true}
            name={user?.name || ""}
            avatar={user?.profilePic?.avatar || ""}
            unseenStories={myStories.length}
            onView={() => setMyStoryOpen(true)}
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