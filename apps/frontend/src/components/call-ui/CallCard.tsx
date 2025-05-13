import { CallStatusDB } from '@/interface/callInterface';
import { CallType } from '@/interface/webRtcInterface';
import React, { memo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import defaultAvatar from "../../assets/defaultAvatar.jpg";
import { Ban, Dot, Phone, PhoneIncoming, PhoneMissed, PhoneOutgoing, Video } from 'lucide-react';
import { getMessageTimestamp, getTimeString } from '@/utils/utility';
import { cn } from '@/lib/utils';

interface Props {
  caller: string;
  callee: string;
  status: CallStatusDB;
  callType: CallType;
  duration: number;
  createdAt: string;
  loggedInUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
}

const CallCard: React.FC<Props> = ({
  callType,
  callee,
  caller,
  createdAt,
  duration,
  loggedInUserId,
  status,
  otherUserName,
  otherUserAvatar
}) => {
  const { time, date } = getMessageTimestamp(new Date(createdAt));
  const isOutgoing = loggedInUserId === caller;
  const isIncoming = loggedInUserId === callee;

  let Icon = PhoneOutgoing;
  let colorClass = "text-gray-600 dark:text-gray-400";
  let nameColorClass = "";

  //handle call status -> initiated
  if(isOutgoing){
    if(status === "rejected"){
      Icon = Ban;
    }else if(status === "connected"){
      colorClass = "text-success";
      nameColorClass = "text-success";
    }
  }else if(isIncoming){
    if(status === "missed"){
      Icon = PhoneMissed;
      colorClass = "text-danger";
      nameColorClass = "text-danger";
    }else if(status === "rejected"){
      Icon = Ban;
    }else if(status === "connected"){
      Icon = PhoneIncoming;
      colorClass = "text-success"
      nameColorClass = "text-success"
    }
  }

  return (
    <div className='w-full rounded-md flex justify-between mb-1 p-2 items-center hover:bg-primary-5 hover:cursor-pointer dark:hover:bg-dark-2'>
      <div className='flex gap-3'>
        <Avatar className='w-14 h-14'>
          <AvatarImage src={otherUserAvatar ? otherUserAvatar : defaultAvatar} />
          <AvatarFallback>{otherUserName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className='flex flex-col gap-1'>
          <p className={cn('font-bold text-lg', nameColorClass)}>{otherUserName}</p>
          <div className='flex ml-1 items-center flex-wrap'>
            <Icon className={cn('w-5 h-5', colorClass)} />
            <p className='text-sm text-gray-600 dark:text-gray-400 ml-3'>{date}, {time}</p>
            <Dot className='w-5 h-5 text-gray-600 dark:text-gray-400' />
            <p className='text-sm text-gray-600 dark:text-gray-400'>{isOutgoing ? "Outgoing" : "Incoming"}</p>
            {status === "connected" && <>
              <Dot className='w-5 h-5 text-gray-600 dark:text-gray-400' />
              <p className='text-sm text-gray-600 dark:text-gray-400'>{getTimeString(duration)}</p>
            </>}
          </div>
        </div>
      </div>
      <div>
        {callType === "audio" && <Phone className='w-6 h-6' />}
        {callType === "video" && <Video className='w-6 h-6' />}
      </div>
    </div>
  )
}

export default memo(CallCard)