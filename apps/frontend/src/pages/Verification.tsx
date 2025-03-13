import Loader from "@/components/Loader";
import MyButton from "@/components/MyButton";
import { useSocket } from "@/context/socketContext";
import { useAppDispatch } from "@/hooks/hooks";
import { useLocalStorageForRoute } from "@/hooks/useLocalStorage";
import type { LoadUserResponse } from "@/interface/interface";
import Info from "@/layouts/Info";
import { setJustUser } from "@/redux/slices/user";
import instance from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const Verification: React.FC = () => {
  const { veriticationToken } = useParams<{ veriticationToken: string }>();
  const [status, setStatus] = useState("verifying");
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { setVerificationAccess, setInitialStepperAccess } = useLocalStorageForRoute();
  const {reconnectSocket} = useSocket();

  const verifyEmail = async () => {
    try {
      setLoading(true);
      const { data } = await instance.get<LoadUserResponse>(`/user/verify/${veriticationToken}`);
      if (data.success) {
        toast.success(data.message);
        reconnectSocket();
        setStatus("verified");
        dispatch(setJustUser(data.data));
        setVerificationAccess(false);
        setInitialStepperAccess(true);
      }
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        toast.error(err.response.data.message);
      }
      setStatus("Something went wrong");
    } finally {
      setLoading(false);
    }
  }
  const handleVerify = async () => {
    await verifyEmail();
    navigate("/initial-stepper");
  }

  return (
    <Info>
      <div className="bg-white p-8 w-[90%] h-[40%] rounded-lg shadow-2xl lg:w-[40%] lg:h-[40%] mt-12 flex flex-col dark:bg-secondary justify-center items-center">
        <h1 className="text-3xl font-bold mb-10">Email Verification</h1> 
        {loading ? <Loader /> : <MyButton
          className="w-[50%]"
          title="Verify Email"
          onClick={handleVerify}
          disabled={loading}
        />}
        {loading && <p className="text-dark-1 dark:text-foreground text-xl font-bold mt-5 capitalize">{status}</p>}
        {status === "verified" && <p className="text-dark-1 dark:text-foreground text-xl font-bold mt-5">Redirecting...</p>}
      </div>
    </Info>
  )
}

export default Verification