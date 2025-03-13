import type { LoginParams, LoginResponse, PushPlatform, RegisterResponse, ResponseWithoutData } from "@/interface/interface";
import { setUser } from "@/redux/slices/user";
import instance from "@/utils/axiosInstance";
import { RESET } from "@/utils/constants";
import { AxiosError } from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAppDispatch } from "./hooks";
import { useLocalStorageForRoute } from "./useLocalStorage";
import { toggleDarkMode } from "@/utils/utility";
import { useSocket } from "@/context/socketContext";

export const useAuthActions = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const {setVerificationAccess, removeRouteItem} = useLocalStorageForRoute();
  const navigate = useNavigate();
  const {reconnectSocket, socket} = useSocket();

  const register = async (formBody: { name: string, email: string, password: string }): Promise<void> => {
    try {
      setLoading(true);
      const { data } = await instance.post<RegisterResponse>("/user/register", formBody);
      if (data.success) {
        setVerificationAccess(true);
        navigate("/operation-info/signup");
        toast.success(data.message);
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      } else { console.log(error); }
    } finally {
      setLoading(false);
    }
  }

  const requestVerificationEmail = async (): Promise<void> => {
    try {
      setLoading(true);
      const { data } = await instance.post<ResponseWithoutData>("/user/request-verification");
      if (data.success) {
        toast.success(data.message);
        setVerificationAccess(true);
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      } else { console.log(error); }
    } finally {
      setLoading(false);
    }
  }

  const login = async (formBody: LoginParams): Promise<void> => {
    try {
      const { data } = await instance.post<LoginResponse>("/user/login", formBody);
      if (data.success) {
        if (!("beginVerification" in data.data)){
          reconnectSocket();
          dispatch(setUser(data.data));
          removeRouteItem("isVerificationAccessible");
          removeRouteItem("isStepperAccessible");
          toggleDarkMode(data.data.settings.theme === "dark");
        }else{
          setVerificationAccess(true);
          navigate("/operation-info/login");
        }
        toast.success(data.message);
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      } else { console.log(error); }
    } finally {
      setLoading(false);
    }
  }

  const loadUser = async (): Promise<void> => {    
    try {
      setLoading(true);
      const { data } = await instance.get<LoginResponse>("/user/me");
      if (data.success) {
        if(!("beginVerification" in data.data)){
          dispatch(setUser(data.data));
          removeRouteItem("isVerificationAccessible");
          removeRouteItem("isStepperAccessible");
          toggleDarkMode(data.data.settings.theme === "dark");
        }else{
          setVerificationAccess(true);
          navigate("/operation-info/login");
        }
      }
    } catch (error) {
      if (!(error instanceof AxiosError && error.response)) {
        console.log(error);
      }
    } finally {
      setLoading(false);
    }
  }

  const logout = async (platform: PushPlatform): Promise<void> => {
    try {
      setLoading(true);
      const { data } = await instance.post<ResponseWithoutData>("/user/logout", { platform });
      if (data.success) {
        toast.success(data.message);
        dispatch({ type: RESET });
        if(socket) socket.disconnect();
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      } else { console.log(error); }
    } finally {
      setLoading(false);
    }
  }
  return {
    register,
    login,
    logout,
    loading,
    requestVerificationEmail,
    setLoading,
    loadUser
  }
}