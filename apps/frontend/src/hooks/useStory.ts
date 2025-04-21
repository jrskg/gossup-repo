import { ResponseWithData } from "@/interface/interface";
import { FriendStoryResponse, MyStory } from "@/interface/storyInterface";
import { setFriendStories, setMyStories, setStoryStateStatus, StoryStateStatus } from "@/redux/slices/story";
import instance from "@/utils/axiosInstance";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAppDispatch } from "./hooks";

const useGetStory = () => {
  const dispatch = useAppDispatch();
  const getMyStories = useCallback(async (): Promise<MyStory[]> => {
    const { data } = await instance.get<ResponseWithData<MyStory[]>>("/story/mine/all");
    return data.data;
  }, []);

  const getFriendStories = useCallback(async (page = 1): Promise<FriendStoryResponse> => {
    const { data } = await instance.get<ResponseWithData<FriendStoryResponse>>(`/story/all?page=${page}`);
    return data.data;
  }, []);

  const loadStories = useCallback(async () => {
    try {
      const results = await Promise.allSettled([getMyStories(), getFriendStories()]);

      const myStoryResult = results[0];
      if (myStoryResult.status === "fulfilled") {
        dispatch(setMyStories(myStoryResult.value));
      } else {
        toast.error(myStoryResult.reason?.response?.data?.message || "Failed to load my stories");
        console.error(myStoryResult.reason);
      }

      const friendStoryResult = results[1];
      if (friendStoryResult.status === "fulfilled") {
        dispatch(setFriendStories(friendStoryResult.value));
      } else {
        toast.error(friendStoryResult.reason?.response?.data?.message || "Failed to load friend stories");
        console.error(friendStoryResult.reason);
      }
    } finally {
      dispatch(setStoryStateStatus("called"));
    }
  }, []);

  return {
    getMyStories,
    getFriendStories,
    loadStories
  }
}

const useLoadStoryWhenPageMounts = (status: StoryStateStatus) => {
  const [loading, setLoading] = useState(false);
  const { loadStories } = useGetStory();

  useEffect(() => {
    (async()=> {
      if (status === "notcalled") {
        setLoading(true);
        await loadStories();
        setLoading(false);
      }
    }
    )();
  }, [status, loadStories]);

  return {
    loading
  }
}

export {
  useGetStory, useLoadStoryWhenPageMounts
};
