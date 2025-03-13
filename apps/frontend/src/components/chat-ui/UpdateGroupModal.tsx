import { SelectedChatContext } from '@/context/contexts';
import { useChatDetailsSocketEmits, useChatDetailsUpdates } from '@/hooks/chatDetailsHooks';
import { useUpdateGroupChat } from '@/hooks/chatHooks';
import { useAppDispatch } from '@/hooks/hooks';
import type { GroupChat, IChat } from '@/interface/chatInterface';
import { cn } from '@/lib/utils';
import { validateGroupName } from '@/utils/validation';
import { CameraIcon } from 'lucide-react';
import React, { Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
import defaultAvatar from '../../assets/defaultAvatar.jpg';
import MyButton from '../MyButton';
import MyDialog from '../MyDialogue';
import MyInput from '../MyInput';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface Props {
  isOpen: boolean
  onClose: Dispatch<SetStateAction<boolean>>
}
const UpdateGroupModal: React.FC<Props> = ({
  isOpen,
  onClose,
}) => {
  const selectedChat = useContext(SelectedChatContext)!;
  const [groupName, setGroupName] = useState("");
  const [groupNameError, setGroupNameError] = useState("");
  const [groupIcon, setGroupIcon] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const inputRef = useRef<null | HTMLInputElement>(null);
  const {
    imageLoading,
    nameLoading,
    uploadPercentage,
    updateGroupName,
    uploadGroupIcon
  } = useUpdateGroupChat(selectedChat._id);
  const dispatch = useAppDispatch();
  const {whenChatUpdated} = useChatDetailsUpdates();
  const {
    emitNameAndIconChange,
  } = useChatDetailsSocketEmits();

  const resetModal = () => {
    if (selectedChat.chatType === "group") {
      setGroupName(selectedChat.groupName);
      setGroupNameError("");
      setGroupIcon(selectedChat.groupIcon ? selectedChat.groupIcon.image : defaultAvatar);
      setSelectedImage(null);
    }
  }

  useEffect(() => {
    if (selectedChat.chatType === "group") {
      setGroupName(selectedChat.groupName);
      setGroupIcon(selectedChat.groupIcon ? selectedChat.groupIcon.image : defaultAvatar);
    }
  }, [selectedChat])


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setGroupIcon(URL.createObjectURL(file));
    }
  }
  const validate = (name: string): boolean => {
    const response = validateGroupName(name);
    setGroupNameError(response.error);
    return response.isValid;
  }
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupName(e.target.value);
    validate(e.target.value);
  }
  const handleImageUpload = async () => {
    if (!selectedImage) return;
    const response = await uploadGroupIcon(selectedImage);
    if (!response) return;
    setGroupIcon(response.image);
    const updatedChat: IChat = { ...selectedChat as GroupChat, groupIcon: response };
    whenChatUpdated(updatedChat, dispatch);
    emitNameAndIconChange(updatedChat);
  }

  const handleUpdateGroupName = async () => {
    if (!validate(groupName)) return;
    const response = await updateGroupName(groupName);
    if (!response) return;
    const updatedChat: IChat = { ...selectedChat as GroupChat, groupName };
    whenChatUpdated(updatedChat, dispatch);
    emitNameAndIconChange(updatedChat);
  }
  return (
    <MyDialog
      isOpen={isOpen}
      setIsOpen={onClose}
      header="Update Group"
      dissmissable={!(imageLoading || nameLoading)}
      onDismiss={resetModal}
    >
      <div className='w-full flex flex-col items-center gap-3'>
        <div className='space-y-4'>
          <div className='relative'>
            <Avatar className='w-52 h-52'>
              <AvatarImage
                className={cn("object-cover", imageLoading && "blur-sm")}
                src={groupIcon ? groupIcon : defaultAvatar} alt="user"
              />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <CameraIcon
              onClick={() => !imageLoading && !nameLoading && inputRef.current?.click()}
              className='p-2 w-10 h-10 absolute bottom-3 right-3 bg-primary-1 dark:bg-dark-3 rounded-full cursor-pointer'
            />
            {imageLoading && <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 dark:bg-dark-2 rounded-full p-3 shadow-lg bg-primary-1'>
              <p className='text-lg'>{uploadPercentage}%</p>
            </div>}
          </div>
          <input type='file' accept='image/*' ref={inputRef} onChange={handleImageChange} className='hidden' />
          {selectedImage && <MyButton
            title='Change Group Icon'
            onClick={handleImageUpload}
            loading={imageLoading}
            disabled={nameLoading}
          />}
        </div>
        <div className='w-full flex flex-col items-center'>
          <MyInput
            value={groupName}
            onChange={handleNameChange}
            disabled={imageLoading || nameLoading}
            placeholder='Eg. My Awesome Group'
            error={groupNameError}
            label='Group Name'
          />
          <MyButton
            title='Change Group Name'
            loading={nameLoading}
            disabled={imageLoading}
            onClick={handleUpdateGroupName}
          />
        </div>
      </div>
    </MyDialog>
  )
}

export default UpdateGroupModal