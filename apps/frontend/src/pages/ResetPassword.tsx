import MyButton from "@/components/MyButton";
import MyInput from "@/components/MyInput";
import { useLocalStorageForRoute } from "@/hooks/useLocalStorage";
import { ResponseWithoutData } from "@/interface/interface";
import Info from "@/layouts/Info"
import instance from "@/utils/axiosInstance";
import { validatePassword } from "@/utils/validation";
import { AxiosError } from "axios";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner";

const ResetPassword = () => {
  const { resetToken } = useParams();
  const [isVerified, setIsVerified] = useState(false);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { removeRouteItem } = useLocalStorageForRoute();

  const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    const passwordCheck = validatePassword(e.target.value);
    setPasswordError(passwordCheck.error);
  }

  const handleVerification = async (): Promise<void> => {
    try {
      setLoading(true);
      const { data } = await instance.post<ResponseWithoutData>("/user/verify-reset-token", { verificationAndResetToken: resetToken });
      if (data.success) {
        setIsVerified(true);
        toast.success(data.message);
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      }
    } finally { setLoading(false); }
    removeRouteItem("isVerificationAccessible");
  }
  const resetPassword = async (): Promise<void> => {
    const checkPassword = validatePassword(password);
    setPasswordError(checkPassword.error);
    if (!checkPassword.isValid) return;
    try {
      setLoading(true);
      const { data } = await instance.post<ResponseWithoutData>("/user/reset-password", { password, verificationAndResetToken: resetToken });
      if (data.success) {
        toast.success(data.message);
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      }
    } finally { setLoading(false); }
  }
  const handleResetPassword = async (): Promise<void> => {
    await resetPassword();
    navigate("/login");
  }
  return (
    <Info>
      <div className={`bg-white p-8 w-[90%] h-[60%] rounded-lg shadow-2xl lg:w-[40%] lg:h-[40%] mt-12 flex flex-col dark:bg-secondary items-center ${!isVerified && "space-y-10"}`}>
        <h1 className="text-3xl font-bold mb-5">Reset Password</h1>
        {
          isVerified ?
            <div className="w-[80%] flex flex-col justify-center items-center gap-3 ">
              <MyInput
                value={password}
                onChange={handleChangePassword}
                error={passwordError}
                disabled={loading}
                type="password"
                label="New Password"
                placeholder="Enter new password"
              />
              <MyButton
                title="Reset Password"
                onClick={handleResetPassword}
              />
            </div> :
            <div className="w-[60%]">
              <MyButton
                title="Verify"
                onClick={handleVerification}
                loading={loading}
              />
            </div>
        }
      </div>
    </Info>
  )
}

export default ResetPassword