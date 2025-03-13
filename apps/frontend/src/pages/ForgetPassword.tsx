import MyButton from "@/components/MyButton";
import MyInput from "@/components/MyInput"
import { useLocalStorageForRoute } from "@/hooks/useLocalStorage";
import type { ResponseWithoutData } from "@/interface/interface";
import LoginSignup from "@/layouts/LoginSignup"
import instance from "@/utils/axiosInstance";
import { validateEmail } from "@/utils/validation";
import { AxiosError } from "axios";
import { useState } from "react";
import { toast } from "sonner";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const {setVerificationAccess} = useLocalStorageForRoute();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    const emailCheck = validateEmail(e.target.value);
    setEmailError(emailCheck.error);
  }

  const handleForgetPassword = async (): Promise<void> => {
    const emailCheck = validateEmail(email);
    setEmailError(emailCheck.error);
    if (!emailCheck.isValid) return;
    try {
      setLoading(true);
      const { data } = await instance.post<ResponseWithoutData>("/user/forget-password", { email });
      if (data.success) {
        toast.success(data.message);
        setVerificationAccess(true);
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      }
    } finally { setLoading(false); }
  }

  return (
    <LoginSignup boxClassName="md:h-[40%]">
      <div className="flex flex-col items-center w-[90%] gap-5">
        <h1 className="text-3xl font-bold m-4">Forget Password</h1>
        <MyInput
          value={email}
          onChange={handleEmailChange}
          label="Email"
          type="email"
          placeholder="Enter your email"
          error={emailError}
          disabled={loading}
        />
        <MyButton
          title="Forget Password"
          onClick={handleForgetPassword}
          loading={loading}
        />
      </div>
    </LoginSignup>
  )
}

export default ForgetPassword;