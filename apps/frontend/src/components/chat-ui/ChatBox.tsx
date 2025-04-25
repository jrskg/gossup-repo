import { LoggedInUserContext, ParticipantsContext, SelectedChatContext } from '@/context/contexts'
import { useGetParticipantsInfo, useSetSelectedChat } from '@/hooks/chatHooks'
import { useChatBoxLogic } from '@/hooks/useChatBoxLogic'
import { cn } from '@/lib/utils'
import { setIsDetailsOn } from '@/redux/slices/selectedChat'
import { AvatarImage } from '@radix-ui/react-avatar'
import { MessageCircleMoreIcon, Phone, SendHorizonalIcon, Video, XIcon } from 'lucide-react'
import React, { memo, useContext } from 'react'
import { Avatar } from '../ui/avatar'
import { Textarea } from '../ui/textarea'
import MessageContainer from './MessageContainer'
import AddAttachments from './AddAttachments'
import SendAttachments from './SendAttachments'
import { useWebRTC } from '@/context/WebRTCContext'
import { IUserShort } from '@/interface/interface'


const getFriendId = (participants: string[], userId: string) => {
  const friendId = participants.find((id) => id !== userId);
  if (!friendId) {
    throw new Error("Friend ID not found");
  }
  return friendId;
}

interface ChatBoxProps {
  className?: string;
}
const ChatBox: React.FC<ChatBoxProps> = ({
  className,
}) => {
  console.log("CHAT BOX rendering... chatbox" + Math.random());
  const { _id: userId, name: userName } = useContext(LoggedInUserContext)!;
  const participants = useContext(ParticipantsContext)!;
  const selectedChat = useContext(SelectedChatContext);
  const { getChatAvatar, getChatName } = useGetParticipantsInfo(participants, userId);
  const handleSelectedChat = useSetSelectedChat();
  const {
    handleSendMessage,
    userMessage,
    dispatch,
    handleInputMessageChange
  } = useChatBoxLogic(selectedChat, userId, userName);

  const {callUser} = useWebRTC();

  const handleCloseChat = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    e.stopPropagation();
    handleSelectedChat(null);
  }
  const handleDetailsClick = () => {
    dispatch(setIsDetailsOn(true));
  }
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  return (
    <div className={cn("transition-all duration-300 bg-primary-5 dark:bg-dark-2 h-full md:rounded-tr-md md:rounded-br-md md:border-l md:dark:border-primary-1 relative", className)}>
      {
        selectedChat ? <>
          <SendAttachments selectedChat={selectedChat} userId={userId} />
          <div 
            onClick={handleDetailsClick} 
            className='w-full bg-primary-1 dark:bg-dark-3 px-5 py-2 md:rounded-tr-md flex items-center gap-2 h-[65px] relative cursor-pointer'
          >
            <Avatar className='w-12 h-12'>
              <AvatarImage className='object-cover' src={getChatAvatar(selectedChat)} />
            </Avatar>
            <div>
              <p className='text-xl font-bold leading-none'>{getChatName(selectedChat)}</p>
              {/* <p className='text-sm'>Status</p> */}
            </div>
            <div className='flex items-center gap-3 ml-auto'>
              <Phone
                onClick={(e) => {
                  e.stopPropagation();
                  const userWithBio = participants[getFriendId(selectedChat.participants, userId)];
                  const user:IUserShort = {
                    _id: userWithBio._id,
                    name: userWithBio.name,
                    profilePic: userWithBio.profilePic,
                  }
                  callUser(user, "audio");
                }}
                className='w-6 h-6 text-primary-5 dark:text-dark-1' />
              <Video
                onClick={(e) => {
                  e.stopPropagation();
                  const userWithBio = participants[getFriendId(selectedChat.participants, userId)];
                  const user:IUserShort = {
                    _id: userWithBio._id,
                    name: userWithBio.name,
                    profilePic: userWithBio.profilePic,
                  }
                  callUser(user, "video");
                }}
                className='w-6 h-6 text-primary-5 dark:text-dark-1' />
            </div>
            <XIcon onClick={handleCloseChat} className='absolute right-3 w-6 h-6 cursor-pointer md:hidden ' />
          </div>
          <MessageContainer
            selectedChatId={selectedChat._id}
            chatType={selectedChat.chatType}
            loggedInUserId={userId}
            participants={participants}
          />
          <div className='h-[85px] absolute bottom-0 left-0 bg-primary-1 dark:bg-dark-3 w-full rounded-br-md flex items-center px-2 justify-evenly'>
            {/* <PaperclipIcon className='md:w-8 md:h-8 w-6 h-6 cursor-pointer' /> */}
            <AddAttachments selectedChatId={selectedChat._id} />
            <Textarea
              rows={2} className='resize-none w-[80%] text-md bg-primary-6 dark:bg-dark-1'
              placeholder='Type a message'
              value={userMessage}
              onChange={handleInputMessageChange}
              onKeyDown={handleKeyDown}
            />
            <div className='flex justify-center items-center bg-primary-6 dark:bg-primary-1 p-2 md:p-3 rounded-full'>
              <SendHorizonalIcon className='w-6 h-6 md:h-8 cursor-pointer md:w-8'
                onClick={handleSendMessage}
              />
            </div>
          </div>
        </> : (
          <div className='w-full h-full flex flex-col justify-center items-center'>
            <MessageCircleMoreIcon className='w-52 h-52 text-primary-1 mb-5' />
            <p className='text-2xl font-bold text-primary-1'>No Chat Selected</p>
            <p className='text-dark-3 dark:text-dark-6'>Click on a user from left chat list</p>
          </div>
        )
      }
    </div>
  )
}

export default memo(ChatBox)
