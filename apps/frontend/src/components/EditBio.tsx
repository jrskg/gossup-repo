import { useAppSelector, useInitialSetup } from '@/hooks/hooks'
import { BIO_LISTS } from '@/utils/constants'
import React, { Dispatch, SetStateAction, useState } from 'react'
import MyButton from './MyButton'
import MyDialog from './MyDialogue'
import MyInput from './MyInput'

interface EditBioProps {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
}
const EditBio: React.FC<EditBioProps> = ({
  isOpen,
  setIsOpen
}) => {
  const { user } = useAppSelector((state) => state.user)
  const [bio, setBio] = useState(user?.bio || "");
  const [bioError, setBioError] = useState("");
  const {updateBio, loading} = useInitialSetup()

  const handleBioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBio(e.target.value)
    if(e.target.value?.trim().length > 0) setBioError("");
    else setBioError("Please write or choose a bio");
  }
  const handleOnDismiss = () => {
    setBio(user?.bio || "")
    setBioError("")
  }
  const handleSave = async () => {
    if(!bio.trim()) return setBioError("Please write or choose a bio");
    await updateBio(bio, () => setIsOpen(false));
  }
  return (
    <MyDialog
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      header='Update Bio'
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
      <div className=''>
        <MyInput
          value={bio}
          onChange={handleBioChange}
          placeholder="Write a best bio"
          disabled={loading}
          error={bioError}
        />
        <div className=" overflow-y-auto h-[300px] mb-5">
          {BIO_LISTS.map((item) => (
            <p
              onClick={() => {setBio(item); setBioError("")}}
              className="block cursor-pointer lg:text-lg border-1 border-red-100 rounded-sm my-1 p-2 hover:bg-primary-4 ease-in-out duration-200 dark:hover:bg-dark-1"
              key={item}
            >{item}</p>
          ))}
        </div>
      </div>
    </MyDialog>
  )
}

export default EditBio;