import type { FriendshipStatus, Image } from '@/interface/interface'
import React, { memo, useState } from 'react'
import MyButton from './MyButton'
import defaultAvatar from "../assets/defaultAvatar.jpg";
import { DotIcon, UserRoundCheckIcon, UserRoundXIcon } from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';
import { getDateStr } from '@/utils/utility';

export interface IRespondParams {
  friendshipId: string
  status: FriendshipStatus
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  isLatest:boolean
}
interface FriendRequestCardProps {
  friendshipId: string
  status: FriendshipStatus
  senderName: string
  senderId: string
  profilePic?: Image
  createdAt: string
  navigate: NavigateFunction
  handleButtonsClick: (params: IRespondParams) => Promise<void>
  isLatest?:boolean
}

const FriendRequestCard: React.FC<FriendRequestCardProps> = ({
  friendshipId,
  status,
  senderName,
  senderId,
  profilePic,
  createdAt,
  navigate,
  handleButtonsClick,
  isLatest = false
}) => {
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [declineLoading, setDeclineLoading] = useState(false);
  // console.log("rendering");
  return (
    //here width is full because the parent conatiner will adjust the width according to the screen (grid)
    <div className='bg-slate-300 dark:bg-dark-2 w-full rounded-sm space-y-2 sm:space-y-1 sm:hover:translate-y-[-5px] hover:shadow-lg cursor-pointer transition-all'>
      <div className='p-2 space-y-1 flex sm:flex-col items-center' onClick={() => navigate(`/user/${senderId}`)}>
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
        <p className='text-xl font-bold text-center'>{senderName}</p>
        <div className='flex items-center'>
          <DotIcon className='w-6 h-6 sm:hidden' />
          <p className='text-sm text-center pt-1'>{getDateStr(createdAt)}</p>
        </div>
      </div>
      <div className='space-x-3 sm:space-x-0 sm:space-y-2 px-2 sm:px-1 pb-2 flex sm:flex-col justify-center'>
        {status === "pending" ? (
          <>
            <MyButton
              title='Accept'
              onClick={async () => { await handleButtonsClick({ friendshipId, status: "accepted", setLoading: setAcceptLoading, isLatest }) }}
              icon={<UserRoundCheckIcon className='w-5 h-5 mr-2' />}
              btnClassName='bg-success hover:bg-success/90 dark:bg-success dark:hover:bg-success/90'
              loading={acceptLoading}
              disabled={declineLoading}
            />
            <MyButton
              title='Decline'
              onClick={async () => { await handleButtonsClick({ friendshipId, status: "rejected", setLoading: setDeclineLoading, isLatest }) }}
              icon={<UserRoundXIcon className='w-5 h-5 mr-2' />}
              btnClassName='bg-danger hover:bg-danger/90 dark:bg-danger dark:hover:bg-danger/90'
              loading={declineLoading}
              disabled={acceptLoading}
            />
          </>
        ) : (
          status === "accepted" ? (
            <div className='flex items-center self-center justify-center mt-2'>
              <UserRoundCheckIcon className='w-4 h-4 mr-2 text-success' />
              <p className='text-success font-bold'>Request Accepted</p>
            </div>
          ) : (
            <div className='flex items-center self-center justify-center mt-2'>
              <UserRoundXIcon className='w-4 h-4 mr-2 text-danger' />
              <p className='text-danger font-bold'>Request Declined</p>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default memo(FriendRequestCard);