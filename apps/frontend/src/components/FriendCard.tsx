import type { Image } from '@/interface/interface';
import { getDateStr } from '@/utils/utility';
import { DotIcon } from 'lucide-react';
import React, { memo } from 'react';
import { NavigateFunction } from 'react-router-dom';
import defaultAvatar from "../assets/defaultAvatar.jpg";

interface FriendCardProps {
  userId: string
  name: string
  profilePic?: Image
  navigate: NavigateFunction
  updatedAt: string
}

const FriendCard: React.FC<FriendCardProps> = ({
  userId,
  name,
  navigate,
  profilePic,
  updatedAt
}) => {
  console.log("rendering friend card");
  return (
    //here width is full because the parent conatiner will adjust the width according to the screen (grid)
    <div className='bg-slate-300 dark:bg-dark-2 w-full rounded-sm space-y-2 sm:space-y-1 sm:hover:translate-y-[-5px] hover:shadow-lg cursor-pointer transition-all'>
      <div className='p-2 space-y-1 flex sm:flex-col items-center' onClick={() => navigate(`/user/${userId}`)}>
        <img
          src={profilePic ? profilePic.image : defaultAvatar}
          alt="user"
          className='hidden sm:inline w-[100%]'
          loading='lazy'
        />
        <img
          src={profilePic ? profilePic.avatar : defaultAvatar}
          alt="user"
          className='sm:hidden w-[60px] h-[60px] rounded-full mr-2'
          loading='lazy'
        />
        <p className='text-xl font-bold text-center'>{name}</p>
        <div className='flex items-center'>
          <DotIcon className='w-6 h-6 sm:hidden' />
          <p className='text-sm text-center pt-1'>{getDateStr(updatedAt)}</p>
        </div>
      </div>
    </div>
  )
}

export default memo(FriendCard);