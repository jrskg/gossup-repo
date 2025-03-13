import FriendsPageLayout from '@/layouts/FriendsPageLayout'
import React, { useCallback, useEffect, useRef, useState } from 'react';
import RequestSentCard, { ICancelAndSendParams } from './RequestSentCard';
import type { FriendRequestSent, FriendshipStatus, ResponseWithData } from '@/interface/interface';
import { useNavigate } from 'react-router-dom';
import instance from '@/utils/axiosInstance';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { removeUpdatedRequestsSent, setRequestsSent, updateRequestsSentStatus, updateOnReqSend } from '@/redux/slices/requestSent';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import Loader from './Loader';
import { useFriendshipActions } from '@/hooks/friendshipHooks';

const FriendRequestSentComp: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { requestsSent } = useAppSelector(state => state.requestsSent);
  const updated = useRef<boolean>(false);
  const { cancelFriendRequest, sendFriendRequest } = useFriendshipActions();

  const getRequestsSent = async () => {
    try {
      setLoading(true);
      const { data } = await instance.get<ResponseWithData<FriendRequestSent[]>>("/friendship/request/sent");
      if (data.success) {
        dispatch(setRequestsSent(data.data));
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      }
    } finally { setLoading(false) }
  }

  const handleBtnClicks = useCallback(
    async (params: ICancelAndSendParams) => {
      const { action, friendshipId, setLoading, userId } = params;
      setLoading(true);
      if (action === "cancel") {
        await cancelFriendRequest(friendshipId, (alreadyFriends) => {
          if (alreadyFriends) dispatch(updateRequestsSentStatus({ friendshipId, status: "accepted" }));
          else dispatch(updateRequestsSentStatus({ friendshipId, status: "canceled" }));
        }, true);
      } else if (action === "send") {
        if (!userId) return;
        await sendFriendRequest(userId, (fId) => {
          dispatch(updateOnReqSend({ friendshipId, newFriendshipId: fId, status: "pending" }));
        }, true);
      }
      setLoading(false);
      updated.current = true;
    },
    []
  );

  const onRefresh = async () => {
    await getRequestsSent();
  }

  useEffect(() => {
    (async () => {
      if (requestsSent.length === 0) {
        await getRequestsSent();
      }
    })();
    return () => {
      dispatch(removeUpdatedRequestsSent(updated.current));
    }
  }, []);

  return (
    <FriendsPageLayout heading='Friend Requests Sent' refreshHandler={onRefresh} refreshLoading={loading}>
      {
        loading ? <div className='w-full h-[40vh] flex justify-center items-center'>
          <Loader />
        </div> : (
          <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 sm:gap-5 justify-center content-center'>
            {
              requestsSent.length > 0 ? requestsSent.map(req => (
                <RequestSentCard
                  key={req._id}
                  receiverId={req.receiver._id}
                  receiverName={req.receiver.name}
                  profilePic={req.receiver?.profilePic}
                  friendshipId={req._id}
                  createdAt={req.createdAt}
                  status={req.status as FriendshipStatus | "canceled"}
                  navigate={navigate}
                  handleButtonsClick={handleBtnClicks}
                />
              )) : (
                <div className='h-[40vh] col-span-full flex justify-center items-center'>
                  <p className='text-3xl'>No friend requests sent</p>
                </div>
              )
            }
          </div>
        )
      }
    </FriendsPageLayout>
  )
}

export default FriendRequestSentComp