import { cn } from '@/lib/utils';
import React from "react";
import defaultAvatar from "../../assets/defaultAvatar.jpg";
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface CallAvatarProps {
  avatar?: string;
  className?: string
}
const CallAvatar: React.FC<CallAvatarProps> = ({ avatar, className }) => {
  return (
    <div className="relative">
      <div className={cn("w-56 h-56 md:w-64 md:h-64 rounded-full p-5 flex items-center justify-center relative overflow-hidden", className)}>
        <Avatar className="w-full h-full select-none pointer-events-none">
          <AvatarImage className='object-cover' src={avatar ? avatar : defaultAvatar} />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        {/* Ringing animation */}
        <div className="absolute inset-0 border-8 border-primary-1 rounded-full animate-call-pulse" />
      </div>
    </div>
  )
}

export default CallAvatar