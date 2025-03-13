import { SelectedChatContext } from '@/context/contexts';
import { useChatDetailsSocketEmits, useChatDetailsUpdates } from '@/hooks/chatDetailsHooks';
import { useCreateGroupChat } from '@/hooks/chatHooks';
import { useAppDispatch } from '@/hooks/hooks';
import { IChat } from '@/interface/chatInterface';
import { validateGroupName } from '@/utils/validation';
import { XIcon } from 'lucide-react';
import React, { Dispatch, memo, SetStateAction, useCallback, useContext, useRef, useState } from 'react';
import { toast } from 'sonner';
import MyButton from '../MyButton';
import MyDialog from '../MyDialogue';
import MyInput from '../MyInput';
import FriendSelector from './FriendSelector';

interface Props {
  isOpen: boolean;
  onClose: Dispatch<SetStateAction<boolean>>;
  isAddParticipant?: boolean
}

interface ISelectedFriend {
  name: string,
  id: string
}

const CreateGroupChatModal: React.FC<Props> = ({
  isOpen,
  onClose,
  isAddParticipant = false
}) => {
  const [groupName, setGroupName] = useState('');
  const [groupNameError, setGroupNameError] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<ISelectedFriend[]>([]);
  const { createGroupChat, loading, addMembersToGroupChat } = useCreateGroupChat();
  const loadingRef = useRef(false);
  const dispatch = useAppDispatch();
  const selectedChat = useContext(SelectedChatContext)!;
  const {
    whenGroupChatCreated,
    whenParticipantsAdded
  } = useChatDetailsUpdates();

  const {
    emitCreateOrAddParticipants
  } = useChatDetailsSocketEmits();

  const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupName(e.target.value);
    setGroupNameError(validateGroupName(e.target.value).error);
  }
  const onRemoveFriend = useCallback((id: string) => {
    if (loadingRef.current) return;
    setSelectedFriends((prev) => prev.filter(f => f.id !== id));
  }, [setSelectedFriends]);

  const resetModalState = useCallback(() => {
    setGroupName('');
    setGroupNameError('');
    setSelectedFriends([]);
  }, []);

  const handleAddOrCreate = async () => {
    if (isAddParticipant) {
      if (!selectedChat._id || selectedFriends.length <= 0) return;
      loadingRef.current = true;
      const newParticipants = selectedFriends.map(f => f.id);
      const response = await addMembersToGroupChat(selectedChat._id, newParticipants);
      loadingRef.current = false;
      if (!response) return;
      const updatedChat:IChat = {
        ...selectedChat,
        participants: [...selectedChat.participants, ...newParticipants]
      };
      // handleSelectedChat(updatedChat);
      // dispatch(updateChat(updatedChat));
      // dispatch(addParticipant(response));
      whenParticipantsAdded(updatedChat, response, dispatch);
      emitCreateOrAddParticipants(updatedChat._id, updatedChat.participants);
    } else {
      const { error, isValid } = validateGroupName(groupName);
      setGroupNameError(error);
      if (!isValid) return;
      if (selectedFriends.length < 2) {
        toast.error("Please select at least two friend");
        return;
      }
      loadingRef.current = true;
      const response = await createGroupChat(groupName.trim(), selectedFriends.map(f => f.id));
      loadingRef.current = false;
      if (!response) return;
      // dispatch(addToChatState({ chats: [response.chat], participants: response.participants }));
      // handleSelectedChat(response.chat);
      whenGroupChatCreated(response.chat, response.participants, dispatch);
      emitCreateOrAddParticipants(response.chat._id, response.chat.participants);
    }
    resetModalState();
    onClose(false);
  }

  const onFriendClick = useCallback(
    (friendId: string, name: string) => {
      if (loadingRef.current) {
        toast.success("HOLD ON BRO!");
        return;
      }
      setSelectedFriends((prev) => {
        if (isAddParticipant) {
          if (selectedChat.participants.some(pId => pId === friendId)) {
            toast.error(`${name} is already in the group`);
            return prev;
          } else if (prev.some(friend => friend.id === friendId)) {
            toast.error(`${name} is already selected`);
            return prev;
          }
          return [...prev, { name, id: friendId }];
        }
        if (prev.some(friend => friend.id === friendId)) {
          toast.error(`${name} is already selected`);
          return prev;
        }
        return [...prev, { name, id: friendId }];
      });
    },
    [selectedChat, isAddParticipant]
  )

  return (
    <MyDialog
      dissmissable={!loading}
      isOpen={isOpen}
      setIsOpen={onClose}
      header={isAddParticipant ? "Select a friends to add" : "Select friends to create group"}
      onDismiss={resetModalState}
      footer={
        <MyButton
          loading={loading}
          title={isAddParticipant ? "Add" : "Create"}
          onClick={handleAddOrCreate}
        />
      }
    >
      <div className='min-h-[400px] max-h-[90vh] h-[80vh] flex flex-col items-center gap-1'>
        <div className='w-full flex flex-col items-center'>
          {!isAddParticipant && <MyInput
            value={groupName}
            onChange={handleGroupNameChange}
            error={groupNameError}
            placeholder="Eg. My Awesome Group"
            disabled={loading}
          />}
          {selectedFriends.length > 0 && <div className='w-full flex flex-wrap gap-2 mb-4'>
            {
              selectedFriends.map(f => (
                <SelectedFriendCard
                  key={f.id}
                  id={f.id}
                  name={f.name}
                  onRemove={onRemoveFriend}
                />
              ))
            }
          </div>}
        </div>
        <FriendSelector onFriendClick={onFriendClick} />
      </div>
    </MyDialog>
  )
}

export default CreateGroupChatModal;

interface SelectedFriendCardProps {
  name: string;
  id: string;
  onRemove: (id: string) => void
}
const SelectedFriendCard: React.FC<SelectedFriendCardProps> = memo(({
  id,
  name,
  onRemove
}) => {
  return (
    <div className='flex items-center gap-1 bg-primary-1 dark:bg-dark-3 rounded-full px-3 py-1'>
      <span className='text-sm font-bold'>{name.length > 10 ? `${name.slice(0, 7)}...` : name}</span>
      <span className='cursor-pointer'>
        <XIcon
          className='w-4 h-4'
          onClick={() => onRemove(id)}
        />
      </span>
    </div>
  )
})