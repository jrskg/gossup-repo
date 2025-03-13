import { IChat } from '@/interface/chatInterface'
import { cn } from '@/lib/utils'
import React, { memo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

interface ChatCardProps {
  avatar: string
  chatName: string
  lastMessage?: string
  lastMessageTime?: string
  chat: IChat
  onChatClick: (chat: IChat) => void
  isChatSelected?: boolean
  newMessageCount: number
}
const ChatCard: React.FC<ChatCardProps> = ({
  avatar,
  chatName,
  lastMessage,
  lastMessageTime,
  chat,
  onChatClick,
  isChatSelected = false,
  newMessageCount = 0
}) => {
  console.log("CARD rendering... " + Math.random(), isChatSelected);
  return (
    <div className={cn("flex items-center justify-between px-2 py-3 hover:bg-primary-5 dark:hover:bg-dark-3 cursor-pointer", isChatSelected && "bg-primary-2 dark:bg-dark-4")}
      onClick={() => onChatClick(chat)}
    >
      <div className='flex items-center gap-2'>
        <Avatar className='w-12 h-12'>
          <AvatarImage className='object-cover' src={avatar} alt="user" />
          <AvatarFallback>C</AvatarFallback>
        </Avatar>
        <div>
          <p className='text-lg font-bold'>{chatName}</p>
          {newMessageCount > 0 ? <p className='text-sm text-green-800 dark:text-success font-bold'>{newMessageCount} New Messages</p> : lastMessage && <p className='text-sm'>{lastMessage}</p>}
        </div>
      </div>
      <div>
        {lastMessageTime && <p className='text-xs'>{lastMessageTime}</p>}
      </div>
    </div>
  )
}
export default memo(ChatCard);