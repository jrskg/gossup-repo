import { generateFCMToken } from "@/services/firebase"
import MyButton from "./MyButton"
import { useState } from "react";
import { useAppDispatch, useInitialSetup } from "@/hooks/hooks";
import { toast } from "sonner";
import { setAuthenticated } from "@/redux/slices/user";
import { useLocalStorageForRoute } from "@/hooks/useLocalStorage";
import { useNavigate } from "react-router-dom";

const NotifPermissionStep = () => {
  const [loading, setLoading] = useState(false);
  const { addPushToken, loading: uploadLoading } = useInitialSetup();
  const { removeRouteItem } = useLocalStorageForRoute();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const addToken = async (): Promise<void> => {
    setLoading(true);
    const fcmToken = await generateFCMToken();
    setLoading(false);
    if (fcmToken) {
      await addPushToken({ token: fcmToken, platform: "web" });
    } else {
      toast.info("You can allow notifications in your browser settings")
    }
    dispatch(setAuthenticated(true));
    removeRouteItem("isStepperAccessible");
    removeRouteItem("isVerificationAccessible");
  }
  const handleNotification = async () => {
    await addToken();
    navigate("/");
  }
  return (
    <div className='flex flex-col bg-slate-300 shadow-md justify-center items-center md:w-[50%] p-4 px-10 rounded-md dark:bg-dark-3 space-y-10'>
      <p className="text-3xl font-bold">Allow Notifications</p>
      <p className="text-xl mt-3 text-center">Click allow on the top left corner of your browser. If you don't see it, click on the button below</p>
      <MyButton
        title="Allow Notifications"
        onClick={handleNotification}
        className="w-[60%]"
        loading={loading || uploadLoading}
      />
    </div>
  )
}

export default NotifPermissionStep;