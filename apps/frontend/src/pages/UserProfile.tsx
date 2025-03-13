import Loader from '@/components/Loader'
import MyButton from '@/components/MyButton'
import ProfilePicCard from '@/components/ProfilePicCard'
import { useUserDetails } from '@/hooks/userDetailsHooks'
import MainLayout from '@/layouts/MainLayout'
import { UserCheckIcon, UserPlusIcon, UserXIcon } from 'lucide-react'
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import defaultAvatar from "../assets/defaultAvatar.jpg"
import ErrorPage from './ErrorPage'
import { useFriendshipActions } from '@/hooks/friendshipHooks'
import { useAppDispatch } from '@/hooks/hooks'
import { updateUserDetails } from '@/redux/slices/userDetails'
import { toast } from 'sonner'

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { userDetails, userDetailsLoading } = useUserDetails(userId ? userId : "");
  const {loading, sendFriendRequest, cancelFriendRequest, respondToFriendRequest} = useFriendshipActions();
  const [rejectLoading, setRejectLoading] = useState(false);
  const dispatch = useAppDispatch();

  const handleSendRequest = async() => {
    if(!userId) return;
    await sendFriendRequest(userId, (friendshipId) => {
      dispatch(updateUserDetails({userId, actionToPerform:"request_sent", friendshipId}));
    });
  }
  const handleCancelRequest = async() => { 
    if(!userId || !userDetails?.friendship?.friendshipId){
      toast.error("Something went wrong try again later");
      return;
    }
    await cancelFriendRequest(userDetails?.friendship?.friendshipId, (alreadyFriends) => {
      if(alreadyFriends) dispatch(updateUserDetails({userId, actionToPerform: "request_accepted"}));
      else dispatch(updateUserDetails({userId, actionToPerform: "request_cancelled"}));
    })
  }
  const handleRespondRequest = async(status:"accepted" | "rejected") => {
    if(!userId || !userDetails?.friendship?.friendshipId) return;
    if(status === "accepted") {
      await respondToFriendRequest(userDetails.friendship.friendshipId, "accepted", () => {
        dispatch(updateUserDetails({userId, actionToPerform: "request_accepted"}));
      })
    }
    else {
      setRejectLoading(true);
      await respondToFriendRequest(userDetails.friendship.friendshipId, "rejected",(alreadyFriends) => {
        if(alreadyFriends) dispatch(updateUserDetails({userId, actionToPerform: "request_accepted"}));
        else dispatch(updateUserDetails({userId, actionToPerform: "request_rejected"}));
      }, true);
      setRejectLoading(false);
    }
  }
  const handleUnfriend = () => {
    toast.success("Will create this feature in the near future")
  }

  const infoWithIcon = (icon: React.ReactNode, infoText: string) => {
    return (
      <div className='flex items-center space-x-3 w-[100%] justify-center border rounded-md border-mixed-1 dark:border-dark-6'>
        {icon}
        <p className='text-lg font-bold'>{infoText}</p>
      </div>
    )
  }

  if (userDetailsLoading) {
    return <MainLayout>
      <div className='flex flex-col items-center justify-center h-[80vh]'>
        <Loader label='Loading User Profile...' />
      </div>
    </MainLayout>
  }
  if (!userDetails) {
    return <ErrorPage
      location={() => navigate(-1)}
      locationLabel='Go Back'
      message="Oops! The user you're looking for either does not exist or deleted his profile."
      statusCode={404}
    />
  }
  return (
    <MainLayout>
      <div className='md:my-6 w-full lg:w-[90%] m-auto flex flex-col md:flex-row justify-center'>
        <div className="p-2 md:p-5 bg-slate-200 md:rounded-sm w-[100%] md:w-[60%] flex flex-col items-center  dark:bg-dark-2">
          <ProfilePicCard
            initialImage={userDetails.profilePic ? userDetails.profilePic.image : defaultAvatar}
          />
          <div className='w-[80%] flex flex-col items-center justify-center space-y-2'>
            <p className='text-2xl font-bold'>{userDetails.name}</p>
            <p className='text-lg text-center'>{userDetails.bio}</p>
          </div>
          <div className='w-[80%] flex flex-col items-center my-5'>
            {
              !userDetails.friendship ? (
                <MyButton
                  btnClassName='bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-600'
                  title='Send Friend Request'
                  onClick={handleSendRequest}
                  icon={<UserPlusIcon className='mr-1 h-5 w-5' />}
                  loading={loading}
                />
              ) : (
                userDetails.friendship.friendshipStatus === "pending" ? (
                  userDetails.friendship.isYouSender ? (
                    <div className='w-[100%] grid grid-cols-1 xl:grid-cols-2 justify-center gap-4'>
                      {infoWithIcon(<UserCheckIcon className='mr-1 h-5 w-5' />, 'Friend Request Sent')}
                      <MyButton
                        btnClassName='bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600'
                        title='Cancel Request'
                        onClick={handleCancelRequest}
                        icon={<UserXIcon className='mr-1 h-5 w-5' />}
                        loading={loading}
                      />
                    </div>
                  ) : (
                    <div className='w-[100%] grid grid-cols-1 xl:grid-cols-2 justify-center gap-4'>
                      <MyButton
                        btnClassName='bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-600'
                        title='Accept Request'
                        onClick={() => handleRespondRequest("accepted")}
                        icon={<UserCheckIcon className='mr-1 h-5 w-5' />}
                        loading={loading}
                        disabled={rejectLoading}
                      />
                      <MyButton
                        btnClassName='bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600'
                        title='Reject Request'
                        onClick={() => handleRespondRequest("rejected")}
                        icon={<UserXIcon className='mr-1 h-5 w-5' />}
                        loading={rejectLoading}
                        disabled={loading}
                      />
                    </div>
                  )
                ) : (
                  <div className='w-[100%] grid grid-cols-1 xl:grid-cols-2 justify-center gap-4'>
                    {infoWithIcon(<UserCheckIcon className='mr-1 h-5 w-5' />, 'Friend')}
                    <MyButton
                      btnClassName='bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600'
                      title='Unfriend'
                      onClick={handleUnfriend}
                      icon={<UserXIcon className='mr-1 h-5 w-5' />}
                      loading={loading}
                    />
                  </div>
                )
              )
            }
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default UserProfile;