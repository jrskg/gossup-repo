import type { ResponseWithData, UserDetails } from "@/interface/interface";
import { addUserDetails, UserDetailsWithPriority } from "@/redux/slices/userDetails";
import instance from "@/utils/axiosInstance";
import { SPECIAL_VALUE_WHEN_USER_NULL } from "@/utils/constants";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "./hooks";

const useUserDetails = (userId: string) => {
  const [userDetailsLoading, setUserDetailsLoading] = useState(true);
  const [currentUserDetails, setCurrentUserDetails] = useState<UserDetails | null>(null);
  const dispatch = useAppDispatch();
  const { users } = useAppSelector(state => state.userDetails);
  const getUserDetails = async (): Promise<void> => {
    if (userId.trim() === "") { toast.error("Something went wrong"); return }
    try {
      const { data } = await instance.get<ResponseWithData<UserDetails>>(`user/${userId}`);
      if (data.success) {
        dispatch(addUserDetails({ userId, userData: data.data }));
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
        if (error.response.data.statusCode === 404) {
          dispatch(addUserDetails({ userId, userData: SPECIAL_VALUE_WHEN_USER_NULL }));
        }
      }
    } finally { setUserDetailsLoading(false); }
  }

  useEffect(() => {
    (async () => {
      const userInStore:UserDetailsWithPriority = users[userId];
      if (userInStore) {
        setUserDetailsLoading(false);
        setCurrentUserDetails(typeof users[userId].userData !== "string" ? users[userId].userData : null);
        return;
      }
      await getUserDetails();
      const fetchedUser:UserDetailsWithPriority | undefined = users[userId];
      if(fetchedUser && typeof fetchedUser.userData !== "string"){
        setCurrentUserDetails(fetchedUser.userData);
      }else{
        setCurrentUserDetails(null);
      }
    })()
  }, [userId, users, getUserDetails]);

  return {
    userDetailsLoading,
    userDetails: currentUserDetails
  }
}

export {
  useUserDetails
};
