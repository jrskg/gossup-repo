import type {
  ChatType,
  DeliveryStatus,
  IAttachment,
  MessageType
} from '@/interface/chatInterface';
import { cn } from '@/lib/utils';
import {
  getAvatarStyle,
  getMainConatainerStyle,
  getMessageBoxStyle,
  getMessageTimestamp,
  getNameStyle,
  getTriangleStyle
} from '@/utils/utility';
import { CheckCheckIcon, CheckIcon, DownloadIcon } from 'lucide-react';
import React, { memo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface MessageCardProps {
  senderId: string;
  senderName: string;
  senderAvatar: string;
  prevSenderId?: string;
  loggedInUserId: string;
  content?: string;
  messgeType: MessageType;
  deliveryStatus: DeliveryStatus;
  attachments: IAttachment[];
  createdAt: string;
  prevCreatedAt?: string;
  chatType: ChatType
}
const MessageCard: React.FC<MessageCardProps> = ({
  loggedInUserId,
  senderId,
  senderAvatar,
  senderName,
  prevSenderId,
  content,
  messgeType,
  deliveryStatus,
  attachments,
  createdAt,
  prevCreatedAt,
  chatType
}) => {
  console.log("MessageCard rendering... " + Math.random());
  const renderAttachment = (attachment: IAttachment) => {
    const downloadButton = (
      <a
        target='_blank'
        href={attachment.fileUrl}
        download={"newfilename"}
        className="p-2"
      >
        <DownloadIcon className='w-6 h-6 dark:hover:text-primary-1 hover:text-[#d3d3d3]' />
      </a>
    );

    switch (attachment.fileType) {
      case 'image':
        return (
          <div className="relative flex flex-col items-start">
            <img
              src={attachment.fileUrl}
              loading='lazy'
              alt={attachment.originalFileName}
              className="w-full max-h-[300px] object-cover rounded-lg"
            />
            {downloadButton}
          </div>
        );
      case 'video':
        return (
          <div className="relative flex flex-col items-start gap-2">
            <video controls className="w-full max-h-[450px] object-cover rounded-lg">
              <source src={attachment.fileUrl} type='video/mp4' />
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case 'audio':
        return (
          <div className="flex flex-col items-start gap-2">
            <audio controls className="w-full sm:w-[300px] md:w-[180px] xl:w-[280px] 2xl:w-[350px]">
              <source src={attachment.fileUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        );
      case 'other':
      default:
        return (
          <div className="flex items-center gap-2 border-[1.5px] rounded-md px-1 dark:border-primary-6 border-dark-1">
            <p className="text-md font-bold">{attachment.originalFileName}</p>
            {downloadButton}
          </div>
        );
    }
  };
  // const { time, date } = getMessageTimestamp(new Date(parseInt(createdAt)));
  // const { date: prevDate } = getMessageTimestamp(prevCreatedAt ? new Date(parseInt(prevCreatedAt)) : undefined);
  const { time, date } = getMessageTimestamp(new Date(createdAt));
  const { date: prevDate } = getMessageTimestamp(prevCreatedAt ? new Date(prevCreatedAt) : undefined);
  return (
    <>
      {date !== prevDate &&
        <div className='w-full flex justify-center items-center mb-2'>
          <p className='bg-secondary text-sm dark:bg-dark-3 px-2 py-1 rounded-md font-bold font-sans'>
            {prevDate ? prevDate : date}
          </p>
        </div>}
      <div className={cn("relative flex w-full mb-[2px]", getMainConatainerStyle(senderId, loggedInUserId))}>
        <Avatar className={cn("w-8 h-8", getAvatarStyle(senderId, loggedInUserId, chatType, prevSenderId))}>
          <AvatarImage className='object-cover' src={senderAvatar} />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className={
          cn("z-10 relative px-2 py-1 max-w-[70%]",
            loggedInUserId === senderId ? "bg-senderMessageColor dark:bg-senderMessageColorDark" : "bg-primary-1 dark:bg-dark-3",
            getMessageBoxStyle(senderId, loggedInUserId, chatType, prevSenderId))
        }>
          <div className={
            cn("-z-10 absolute h-0 w-0 border-l-[20px] border-t-[20px] border-r-[20px] border-l-transparent border-r-transparent top-0",
              loggedInUserId === senderId ? "border-t-senderMessageColor dark:border-t-senderMessageColorDark" : "border-t-primary-1 dark:border-t-dark-3",
              getTriangleStyle(senderId, loggedInUserId, prevSenderId))
          } />
          <p className={cn("font-bold text-sm", getNameStyle(senderId, loggedInUserId, chatType, prevSenderId))}>
            {senderName}
          </p>
          <div className={cn("flex", 
            content && content.length > 20 ? "flex-col" : "flex-row gap-2",
            messgeType === "file" && "flex-col"
          )}>
            {messgeType === "text" ?
              <p className='p-[2px] text-justify'>{content}</p> :
              <>
                <div className="flex flex-col justify-center items-start">
                  {
                    attachments.map((attachment) => (
                      <div key={attachment.fileUrl} className="p-1 w-full">
                        {renderAttachment(attachment)}
                      </div>
                    ))
                  }
                </div>
                {content && <p className="p-1 pl-2">{content}</p>}
              </>
            }
            <div
              className={cn("flex gap-2 self-end items-center justify-center ")}
            >
              <p className='text-[13px]'>{time}</p>
              {senderId === loggedInUserId &&
                (() => {
                  switch (deliveryStatus) {
                    case "sent":
                      return <CheckIcon className='w-5 h-5 text-[#2b2b2b] dark:text-[#d1d1d1]' />
                    case "delivered":
                      return <CheckCheckIcon className='w-5 h-5 text-[#2b2b2b] dark:text-[#d1d1d1]' />
                    case "seen":
                      return <CheckCheckIcon className='w-5 h-5 text-[#ffea31] dark:text-[#18beff]' />
                  }
                })()
              }
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default memo(MessageCard)