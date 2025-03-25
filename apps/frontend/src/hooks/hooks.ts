import type { ImageResponse, PushToken, ResponseWithoutData, Theme } from "@/interface/interface";
import { setJustUser } from "@/redux/slices/user";
import instance from "@/utils/axiosInstance";
import { toggleDarkMode } from "@/utils/utility";
import { AxiosError } from "axios";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import type { AppDispatch, RootState } from "../redux/store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

// export const useConnection = (): { checkConnection: () => boolean } => {
//   console.log("Called");

//   const checkConnection = (): boolean => {
//     if (navigator.onLine) return true;
//     toast.error("No internet connection", {
//       description: "Please check your internet connection and try again",
//     });
//     return false;
//   }
//   return {
//     checkConnection
//   }
// }

export const useInitialSetup = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  const updateProfilePic = async (file: File, onSuccess?: () => void) => {
    try {
      setLoading(true);
      const { data } = await instance.post<ImageResponse>("/user/profile", { profilePic: file }, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (data.success) {
        toast.success(data.message);
        if (user) {
          dispatch(setJustUser({
            ...user,
            profilePic: data.data
          }));
        }
        if (onSuccess && typeof onSuccess === "function") onSuccess();
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      } else { console.log(error); }
    } finally { setLoading(false); }
  }

  const updateBio = async (bio: string, onSuccess?: () => void) => {
    try {
      setLoading(true);
      const { data } = await instance.put<ResponseWithoutData>("/user/bio", { bio });
      if (data.success) {
        toast.success(data.message);
        if (user) {
          dispatch(setJustUser({
            ...user,
            bio
          }));
        }
        if (onSuccess && typeof onSuccess === "function") onSuccess();
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      } else { console.log(error); }
    } finally { setLoading(false); }
  }

  const addPushToken = async (tokenObj: PushToken) => {
    try {
      setLoading(true);
      const { data } = await instance.post<ResponseWithoutData>("/user/push-token", tokenObj);
      if (data.success) {
        toast.success(data.message);
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      } else { console.log(error); }
    } finally { setLoading(false); }
  }

  return {
    updateProfilePic,
    updateBio,
    addPushToken,
    loading
  }
}

interface UpdateSettingParams {
  notificationEnabled?: boolean;
  theme?: Theme;
  soundEnabled?: boolean;
}

export const useSettingActions = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);

  const updateSettings = async (params: UpdateSettingParams, onSuccess?: () => void) => {
    if (Object.keys(params).length === 0) return;
    try {
      setLoading(true);
      const { data } = await instance.put<ResponseWithoutData>("/user/settings", params);
      if (data.success) {
        toast.success(data.message);
        if (onSuccess && typeof onSuccess === "function") onSuccess();
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      } else { console.log(error); }
    } finally { setLoading(false); }
  }

  const toggleTheme = async (isDarkMode: boolean) => {
    await updateSettings({ theme: isDarkMode ? "dark" : "light" }, () => {
      if (user) {
        const theme: Theme = isDarkMode ? "dark" : "light";
        const newSettings = { ...user.settings, theme };
        dispatch(setJustUser({
          ...user,
          settings: newSettings
        }));
        toggleDarkMode(isDarkMode);
      }
    });
  }

  const toggleNotification = async (enabled: boolean) => {
    await updateSettings({ notificationEnabled: enabled }, () => {
      if (user) {
        const newSettings = { ...user.settings, notificationEnabled: enabled };
        dispatch(setJustUser({
          ...user,
          settings: newSettings
        }));
      }
    });
  }

  const toggleSound = async (enabled: boolean) => {
    await updateSettings({ soundEnabled: enabled }, () => {
      if (user) {
        const newSettings = { ...user.settings, soundEnabled: enabled };
        dispatch(setJustUser({
          ...user,
          settings: newSettings
        }));
      }
    });
  }

  return {
    toggleTheme,
    loading,
    toggleNotification,
    toggleSound,
    updateSettings
  }
}