import React, { memo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface Props {
  userId: string
  name: string
  avatar: string
  onClick?: (userId: string, name:string, avatar: string) => void
}

const FriendCardSimple: React.FC<Props> = ({
  avatar,
  name,
  onClick = () => { },
  userId
}) => {
  console.log("Simple FriendCard rendering..."+ Math.random());
  
  return (
    <div
      onClick={() => onClick(userId, name, avatar)}
      className="flex items-center gap-2 px-2 py-1 mt-1 hover:bg-primary-1 dark:hover:bg-mixed-2 cursor-pointer rounded-sm">
      <Avatar className='w-12 h-12'>
        <AvatarImage className='object-cover' src={avatar} alt="user" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
      <p className="font-bold">{name}</p>
    </div>
  )
}

export default memo(FriendCardSimple);