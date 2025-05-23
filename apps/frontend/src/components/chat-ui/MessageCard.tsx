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
import { DownloadIcon } from 'lucide-react';
import React, { memo } from 'react';
import MessageTick from '../MessageTick';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface MessageCardProps {
  senderId: string;
  senderName: string;
  senderAvatar: string;
  // prevSenderId?: string;
  loggedInUserId: string;
  nextSenderId?: string;
  content?: string;
  messgeType: MessageType;
  deliveryStatus: DeliveryStatus;
  attachments: IAttachment[];
  createdAt: string;
  // prevCreatedAt?: string;
  nextCreatedAt?: string;
  chatType: ChatType
}
const MessageCard: React.FC<MessageCardProps> = ({
  loggedInUserId,
  senderId,
  senderAvatar,
  senderName,
  // prevSenderId,
  nextSenderId,
  content,
  messgeType,
  deliveryStatus,
  attachments,
  createdAt,
  // prevCreatedAt,
  nextCreatedAt,
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

  const { time, date } = getMessageTimestamp(new Date(createdAt));
  const { date: nextDate } = getMessageTimestamp(nextCreatedAt ? new Date(nextCreatedAt) : undefined);

  return (
    <>
      {nextDate === "" &&
        <div className='w-full flex justify-center items-center my-2'>
          <p className='bg-secondary text-sm dark:bg-dark-3 px-2 py-1 rounded-md font-bold font-sans'>
            {date}
          </p>
        </div>
      }
      <div className={cn("relative flex w-full mb-[2px]", getMainConatainerStyle(senderId, loggedInUserId))}>
        <Avatar className={cn("w-8 h-8", getAvatarStyle(senderId, loggedInUserId, chatType, nextSenderId))}>
          <AvatarImage className='object-cover' src={senderAvatar} />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className={
          cn("z-10 relative px-2 py-1 max-w-[70%]",
            loggedInUserId === senderId ? "bg-senderMessageColor dark:bg-senderMessageColorDark" : "bg-primary-1 dark:bg-dark-3",
            getMessageBoxStyle(senderId, loggedInUserId, chatType, nextSenderId))
        }>
          <div className={
            cn("-z-10 absolute h-0 w-0 border-l-[20px] border-t-[20px] border-r-[20px] border-l-transparent border-r-transparent top-0",
              loggedInUserId === senderId ? "border-t-senderMessageColor dark:border-t-senderMessageColorDark" : "border-t-primary-1 dark:border-t-dark-3",
              getTriangleStyle(senderId, loggedInUserId, nextSenderId))
          } />
          <p className={cn("font-bold text-sm", getNameStyle(senderId, loggedInUserId, chatType, nextSenderId))}>
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
                <MessageTick deliveryStatus={deliveryStatus} />
              }
            </div>
          </div>
        </div>
      </div>
      {date !== nextDate && nextDate !== "" &&
        <div className='w-full flex justify-center items-center my-2'>
          <p className='bg-secondary text-sm dark:bg-dark-3 px-2 py-1 rounded-md font-bold font-sans'>
            {date}
          </p>
        </div>
      }
    </>
  )
}

export default memo(MessageCard)