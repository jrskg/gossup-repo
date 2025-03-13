import React, { Dispatch, SetStateAction, useState } from 'react'
import MyDialog from './MyDialogue'
import { useAppDispatch, useAppSelector } from '@/hooks/hooks'
import MyInput from './MyInput'
import { validateName } from '@/utils/validation'
import MyButton from './MyButton'
import instance from '@/utils/axiosInstance'
import type { ResponseWithoutData } from '@/interface/interface'
import { toast } from 'sonner'
import { setJustUser } from '@/redux/slices/user'
import { AxiosError } from 'axios'

interface EditNameProps {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
}

const EditName: React.FC<EditNameProps> = ({
  isOpen,
  setIsOpen
}) => {
  const {user} = useAppSelector((state) => state.user)
  const [name, setName] = useState(user?.name || "");
  const [nameError, setNameError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const handleNameChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    const response = validateName(e.target.value);
    setNameError(response.error)
  }
  const handleOnDismiss = () => {
    setName(user?.name || "")
    setNameError("")
  }
  const handleSave = async () => {
    const response = validateName(name);
    if (!response.isValid) {
      setNameError(response.error);
      return;
    }else setNameError("");
    try {
      setLoading(true);
      const {data} = await instance.put<ResponseWithoutData>("/user/name", {name});
      if(data.success){
        toast.success(data.message);
        if(user) dispatch(setJustUser({...user, name}));
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
      header='Update Name'
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
          value={name}
          onChange={handleNameChange}
          label='Name'
          placeholder='Enter name'
          error={nameError}
          disabled={loading}
        />
      </div>
    </MyDialog>
  )
}

export default EditName