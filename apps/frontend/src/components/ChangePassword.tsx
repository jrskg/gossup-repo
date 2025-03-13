import type { ResponseWithoutData } from '@/interface/interface'
import instance from '@/utils/axiosInstance'
import { validatePassword } from '@/utils/validation'
import { AxiosError } from 'axios'
import React, { Dispatch, SetStateAction, useState } from 'react'
import { toast } from 'sonner'
import MyButton from './MyButton'
import MyDialog from './MyDialogue'
import MyInput from './MyInput'

interface EditChPassProps {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
}

const ChangePassword: React.FC<EditChPassProps> = ({
  isOpen,
  setIsOpen
}) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [oldPasswordError, setOldPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");

  const [loading, setLoading] = useState(false);

  const handleOldChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    setOldPassword(e.target.value);
    if(e.target.value?.trim().length > 0) setOldPasswordError("");
    else setOldPasswordError("Please enter your old password");
  }
  const handleNewChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    const response = validatePassword(e.target.value);
    setNewPasswordError(response.error);
  }
  const handleOnDismiss = () => {
    setOldPassword("");
    setNewPassword("");
    setOldPasswordError("");
    setNewPasswordError("");
  }
  const handleSave = async () => {
    let error = [];
    const response = validatePassword(newPassword);
    if (!response.isValid) setNewPasswordError(response.error);
    else setNewPasswordError("");
    error.push(response.isValid);
    if(oldPassword.trim() == "") setOldPasswordError("Please enter your old password");
    else setOldPasswordError("");
    error.push(oldPassword.trim() !== "");
    if(!error.every(e => e)) return;
    try {
      setLoading(true);
      const {data} = await instance.put<ResponseWithoutData>("/user/change-password", {oldPassword, newPassword});
      if(data.success){
        toast.success(data.message);
        setIsOpen(false);
      }
    } catch (error) {
      if(error instanceof AxiosError && error.response){
        toast.error(error.response.data.message);
      }
    } finally{setLoading(false);}
  }
  return (
    <MyDialog
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      header='Change Password'
      dissmissable={!loading}
      onDismiss={handleOnDismiss}
      footer={
        <MyButton
          title='Save'
          onClick={handleSave}
          className='w-[30%]'
          loading={loading}
        />
      }
    >
      <div>
        <MyInput
          value={oldPassword}
          onChange={handleOldChange}
          label='Old Password'
          placeholder='Enter your old password'
          error={oldPasswordError}
          disabled={loading}
        />
        <MyInput
          value={newPassword}
          onChange={handleNewChange}
          label='New Password'
          placeholder='Enter your new password'
          error={newPasswordError}
          disabled={loading}
        />
      </div>
    </MyDialog>
  )
}

export default ChangePassword