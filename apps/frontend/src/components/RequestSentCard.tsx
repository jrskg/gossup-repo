import type { FriendshipStatusExtended, Image } from '@/interface/interface';
import { getDateStr } from '@/utils/utility';
import { DotIcon, UserPlusIcon, UserRoundCheckIcon, UserXIcon } from 'lucide-react';
import React, { memo, useState } from 'react';
import { NavigateFunction } from 'react-router-dom';
import defaultAvatar from "../assets/defaultAvatar.jpg";
import MyButton from './MyButton';

export interface ICancelAndSendParams {
  friendshipId: string
  userId?:string
  action: "send" | "cancel"
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
}
interface FriendRequestCardProps {
  friendshipId: string
  status: FriendshipStatusExtended
  receiverName: string
  receiverId: string
  profilePic?: Image
  createdAt: string
  navigate: NavigateFunction
  handleButtonsClick: (params: ICancelAndSendParams) => Promise<void>
}

const RequestSentCard: React.FC<FriendRequestCardProps> = ({
  friendshipId,
  status,
  receiverName,
  receiverId,
  profilePic,
  createdAt,
  navigate,
  handleButtonsClick,
}) => {
  const [loading, setLoading] = useState(false);
  // console.log("rendering request sent card");
  return (
    //here width is full because the parent conatiner will adjust the width according to the screen (grid)
    <div className='bg-slate-300 dark:bg-dark-2 w-full rounded-sm space-y-2 sm:space-y-1 sm:hover:translate-y-[-5px] hover:shadow-lg cursor-pointer transition-all'>
      <div className='p-2 space-y-1 flex sm:flex-col items-center' onClick={() => navigate(`/user/${receiverId}`)}>
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
        <p className='text-xl font-bold text-center'>{receiverName}</p>
        <div className='flex items-center'>
          <DotIcon className='w-6 h-6 sm:hidden' />
          <p className='text-sm text-center pt-1'>{getDateStr(createdAt)}</p>
        </div>
      </div>
      <div className='space-x-3 sm:space-x-0 sm:space-y-2 px-2 sm:px-1 pb-2 flex sm:flex-col justify-center'>
        {status === "pending" ? (
          <MyButton
            title='Cancel Request'
            onClick={async () => { await handleButtonsClick({ friendshipId, action: "cancel", setLoading }) }}
            icon={<UserXIcon className='w-5 h-5 mr-2' />}
            btnClassName='bg-danger hover:bg-danger/90 dark:bg-danger dark:hover:bg-danger/90'
            loading={loading}
          />
        ) : (
          status === "canceled" || status === "rejected" ? (
            <MyButton
              title='Send Request'
              onClick={async () => { await handleButtonsClick({ friendshipId, action: "send", setLoading, userId:receiverId }) }}
              icon={<UserPlusIcon className='w-5 h-5 mr-2' />}
              btnClassName='bg-success hover:bg-success/90 dark:bg-success dark:hover:bg-success/90'
              loading={loading}
            />
          ) : (
            <div className='flex items-center self-center justify-center mt-2'>
              <UserRoundCheckIcon className='w-4 h-4 mr-2 text-success' />
              <p className='text-success font-bold'>Request Already Accepted</p>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default memo(RequestSentCard);