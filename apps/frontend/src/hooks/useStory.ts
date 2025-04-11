import { ResponseWithData } from "@/interface/interface";
import { FriendStoryResponse, MyStory } from "@/interface/storyInterface";
import { setFriendStories, setMyStories, setStoryStateStatus, StoryStateStatus } from "@/redux/slices/story";
import instance from "@/utils/axiosInstance";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAppDispatch } from "./hooks";

const useGetStory = () => {
  const getMyStories = async (): Promise<MyStory[]> => {
    const { data } = await instance.get<ResponseWithData<MyStory[]>>("/story/mine/all");
    return data.data;
  }

  const getFriendStories = async (page = 1): Promise<FriendStoryResponse> => {
    const { data } = await instance.get<ResponseWithData<FriendStoryResponse>>(`/story/all?page=${page}`);
    return data.data;
  }

  return {
    getMyStories,
    getFriendStories
  }
}

const useLoadStoryWhenPageMounts = (status: StoryStateStatus) => {
  const [loading, setLoading] = useState(false);
  const { getMyStories, getFriendStories } = useGetStory();

  const dispatch = useAppDispatch();

  useEffect(() => {
    const loadStories = async() => {
      try {
        setLoading(true);
        const results = await Promise.allSettled([getMyStories(), getFriendStories()]);
        const myStoryResult = results[0];
        if(myStoryResult.status === "fulfilled"){
          dispatch(setMyStories(myStoryResult.value));
        }else{
          toast.error(myStoryResult.reason?.response?.data?.message || "Failed to load my stories");
          console.error(myStoryResult.reason);
        }

        const friendStoryResult = results[1];
        if(friendStoryResult.status === "fulfilled"){
          dispatch(setFriendStories(friendStoryResult.value))
        }else{
          toast.error(friendStoryResult.reason?.response?.data?.message || "Failed to load friend stories");
          console.error(friendStoryResult.reason);
        }
      }finally{
        setLoading(false);
        dispatch(setStoryStateStatus("called"));
      }
    }

    if(status === "notcalled"){
      loadStories();
    }
  }, [status]);

  return {
    loading
  }
}

export {
  useGetStory, useLoadStoryWhenPageMounts
};
