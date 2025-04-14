import { WhoseStory } from '@/interface/storyInterface';
import { getSmartTimestamp } from '@/utils/utility';
import { ArrowLeft, Dot, EllipsisVerticalIcon } from 'lucide-react';
import React, { memo, useRef, useState } from 'react';
import defaultAvatar from "../../assets/defaultAvatar.jpg";
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { MyAlert } from '../MyAlert';
import instance from '@/utils/axiosInstance';
import { ResponseWithoutData } from '@/interface/interface';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { useAppDispatch } from '@/hooks/hooks';
import { deleteMyStory } from '@/redux/slices/story';

interface Props {
  createdAt: string;
  whose: WhoseStory;
  storyId: string;
  storyOwner: {
    name: string;
    avatar?: string;
  },
  onClose: () => void
}

const StoryHeader: React.FC<Props> = ({
  createdAt,
  whose,
  storyId,
  storyOwner,
  onClose
}) => {
  console.log("render story header");
  const { name, avatar } = storyOwner;
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const btnRef = useRef<HTMLButtonElement | null>(null);

  const handleStoryDelete = async() => {
    try {
      setLoading(true);
      const {data} = await instance.delete<ResponseWithoutData>(`/story/mine/${storyId}`);
      toast.success(data.message);
      dispatch(deleteMyStory(storyId));
      onClose();
    } catch (error) {
      if(error instanceof AxiosError && error.response){
        toast.error(error.response.data.message);
      }
    }finally{setLoading(false)}
  }
  return (
    <div className='flex items-center justify-between my-2 px-2'>
      <MyAlert
        alertTriggerComponent={
          <button
            ref={btnRef}
            className='hidden'
          >Hidden</button>
        }
        title='Delete Story'
        description='Are you sure you want to delete this story ?'
        okText="Delete"
        okHandler={handleStoryDelete}
        loading={loading}
        okBtnClassName='bg-danger hover:bg-[red] dark:bg-danger dark:hover:bg-danger'
      />
      <div className='flex items-center gap-3'>
        <ArrowLeft
          className='w-6 h-6 cursor-pointer text-white '
          onClick={onClose}
        />
        <div className='flex items-center'>
          <Avatar className='w-8 h-8'>
            <AvatarImage className='object-cover' src={avatar ? avatar : defaultAvatar} alt="user" />
            <AvatarFallback>C</AvatarFallback>
          </Avatar>
          <p className='text-lg font-bold ml-2 text-white '>{name}</p>
          <Dot className='w-6 h-6 mx-2 text-white ' />

          <p className='text-sm text-white '>{getSmartTimestamp(new Date(createdAt))}</p>
        </div>
      </div>
      {whose === WhoseStory.Mine &&
        <DropdownMenu open={dropDownOpen} onOpenChange={(ok) => setDropDownOpen(ok)}>
          <DropdownMenuTrigger>
            <EllipsisVerticalIcon className='w-6 h-6 cursor-pointer text-white ' />
          </DropdownMenuTrigger>
          <DropdownMenuContent className='bg-primary-3 dark:bg-dark-2 border-none'>
            <DropdownMenuItem
              onClick={() => btnRef.current?.click()}
              className='cursor-pointer'
            >
              Delete Story
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    </div>
  )
}

export default memo(StoryHeader);