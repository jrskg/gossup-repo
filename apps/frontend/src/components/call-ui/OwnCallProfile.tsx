import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { IUserShort } from '@/interface/interface';
import defaultAvatar from "../../assets/defaultAvatar.jpg"

interface Props{
  user:IUserShort
}
const OwnCallProfile: React.FC<Props> = ({user}) => {
  return (
    <div className="w-full h-full rounded-full bg-primary-5 dark:bg-gray-700 flex items-center justify-center">
      <Avatar className="w-full h-full select-none pointer-events-none">
        <AvatarImage className='object-cover' src={user.profilePic ? user.profilePic.avatar : defaultAvatar} alt="user" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    </div>
  )
}

export default OwnCallProfile