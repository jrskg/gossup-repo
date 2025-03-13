import type { FriendshipStatus, FriendsResponseData, ResponseWithData } from "@/interface/interface";
import { appendToFriends, appendToSearchedFriends, clearSearchedFriends, setFriends, setSearchedFriends } from "@/redux/slices/friends";
import instance from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "./hooks";

interface IFriendshipActionResponse {
  alreadyFriends?: boolean
}
interface IFriendshipId {
  friendshipId: string
}
const useFriendshipActions = () => {
  const [loading, setLoading] = useState(false);
  const sendFriendRequest = async (receiverId: string, cb: (friendshipId: string) => void, preventLoading: boolean=false) => {
    try {
      if(!preventLoading) setLoading(true);
      const { data } = await instance.post<ResponseWithData<IFriendshipId>>("/friendship/create", {
        receiverId
      });
      if (data.success) {
        toast.success("Friend request sent");
        cb(data.data.friendshipId);
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      }
    }
    finally { if(!preventLoading) setLoading(false) }
  }
  const respondToFriendRequest = async (friendshipId: string, status: FriendshipStatus, cb: (alreadyFriends?:boolean) => void, preventLoading: boolean=false) => {
    try {
      if(!preventLoading) setLoading(true);
      const { data } = await instance.post<ResponseWithData<IFriendshipActionResponse>>("/friendship/request/respond", { friendshipId, status });
      if (data.success) {
        toast.success(data.message);
        if (data.data?.alreadyFriends && data.data.alreadyFriends === true) {
          cb(true);
        } else {
          cb();
        }
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      }
    } finally { if(!preventLoading)setLoading(false) }
  }
  const cancelFriendRequest = async (friendshipId: string, cb:(alreadyFriends?:boolean) => void, preventLoading: boolean=false) => {
    try {
      if(!preventLoading) setLoading(true);
      const { data } = await instance.delete<ResponseWithData<IFriendshipActionResponse>>(`/friendship/request/cancel/${friendshipId}`);
      if (data.success) {
        if (data.data?.alreadyFriends && data.data.alreadyFriends === true) {
          cb(true);
        } else {
          cb();
        }
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      }
    } finally { if(!preventLoading) setLoading(false) }
  }

  return {
    sendFriendRequest,
    respondToFriendRequest,
    cancelFriendRequest,
    loading
  }
}

const useGetAndSearchFriends = () => {
  const [mainLoading, setMainLoading] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [searchedHasMore, setSearchedHasMore] = useState(false);

  const dispatch = useAppDispatch();
  const {friends, searchedFriends} = useAppSelector(state => state.friends);

  const getFriends = async(page:number) => {
    try {
      if(page === 1) setMainLoading(true);
      else setMoreLoading(true);
      const {data} = await instance.get<ResponseWithData<FriendsResponseData>>(`/friendship/friends?page=${page}`);
      if(data.success){
        if(page === 1)dispatch(setFriends(data.data.friends));
        else dispatch(appendToFriends(data.data.friends));
        setHasMore(data.data.hasMore);
      }
    } catch (error) {
      if(error instanceof AxiosError && error.response){
        toast.error(error.response.data.message);
      }
    }finally{
      if(page === 1) setMainLoading(false);
      else setMoreLoading(false);
    }
  }
  const searchInFriends = async(page:number, searchQuery:string) => {
    try {
      if(page === 1) setMainLoading(true);
      else setMoreLoading(true);
      const {data} = await instance.get<ResponseWithData<FriendsResponseData>>(`/friendship/friends/search?page=${page}&search=${searchQuery}`);
      if(data.success){
        if(page === 1)dispatch(setSearchedFriends(data.data.friends));
        else dispatch(appendToSearchedFriends(data.data.friends));
        setSearchedHasMore(data.data.hasMore);
      }
    } catch (error) {
      if(error instanceof AxiosError && error.response){
        toast.error(error.response.data.message);
      }
    }finally{
      if(page === 1) setMainLoading(false);
      else setMoreLoading(false);
    }
  }
  const clearSearchResult = () => {
    dispatch(clearSearchedFriends());
  }
  return{
    mainLoading,
    moreLoading,
    friends,
    searchedFriends,
    getFriends,
    searchInFriends,
    hasMore,
    searchedHasMore,
    clearSearchResult
  }
}

export {
  useFriendshipActions,
  useGetAndSearchFriends
};
