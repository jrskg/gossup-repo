import type { Image } from '@/interface/interface';
import React, { memo } from 'react';
import defaultAvatar from "../../assets/defaultAvatar.jpg"
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ClickedMemberInfo } from './ChatDetails';

interface GroupMemberCardProps {
  profilePic?: Image;
  name: string;
  bio: string;
  userId: string;
  isAdmin: boolean;
  handleClick: (userInfo:ClickedMemberInfo) => void
}

const GroupMemberCard: React.FC<GroupMemberCardProps> = ({
  profilePic,
  name,
  bio,
  isAdmin,
  userId,
  handleClick
}) => {
  console.log("GroupMemberCard rendering..."+ Math.random());
  return (
    <div onClick={() => handleClick({memberId:userId, isAdmin, name})} className='w-full  flex gap-2 px-2 py-1 mt-1 hover:bg-primary-1 dark:hover:bg-mixed-2 cursor-pointer rounded-sm'>
      <Avatar className="w-12 h-12">
        <AvatarImage src={profilePic ? profilePic.avatar : defaultAvatar} alt="user" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
      <div className='w-full'>
        <div className='flex justify-between '>
          <p className='font-bold'>{name}</p>
          {isAdmin && <p className='text-md text-[#108a1a] dark:text-[#37ff48] font-bold'>Admin</p>}
        </div>
        <p className='text-md text-dark-2 dark:text-[#d8d8d8]'>{bio.slice(0, 45)}{bio.length > 45 ? "..." : ""}</p>
      </div>
    </div>
  )
}

export default memo(GroupMemberCard);