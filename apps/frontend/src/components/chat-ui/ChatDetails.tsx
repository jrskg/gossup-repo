import { LoggedInUserContext, ParticipantsContext, SelectedChatContext } from '@/context/contexts';
import { useChatDetailsSocketEmits, useChatDetailsUpdates } from '@/hooks/chatDetailsHooks';
import { useChatActions, useGetParticipantsInfo, useSetSelectedChat } from '@/hooks/chatHooks';
import { useAppDispatch } from '@/hooks/hooks';
import type { Participants } from '@/interface/chatInterface';
import { cn } from '@/lib/utils';
import { addToChatState, removeChat } from '@/redux/slices/chats';
import { setIsDetailsOn } from '@/redux/slices/selectedChat';
import { getJITBtnStyle } from '@/utils/styleUtils';
import { DialogDescription } from '@radix-ui/react-dialog';
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { LogOutIcon, PencilIcon, Plus, XIcon } from 'lucide-react';
import React, { memo, useCallback, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Loader from '../Loader';
import { MyAlert } from '../MyAlert';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '../ui/dialog';
import CreateGroupChatModal from './CreateGroupChatModal';
import GroupMemberCard from './GroupMemberCard';
import UpdateGroupModal from './UpdateGroupModal';

export interface ClickedMemberInfo {
  memberId: string;
  isAdmin: boolean;
  name: string
}
interface ChatDetailsProps {
  className?: string;
}
const ChatDetails: React.FC<ChatDetailsProps> = ({
  className,
}) => {
  const [addParticipantsModal, setAddParticipantsModal] = useState(false);
  const [updateGroupModal, setUpdateGroupModal] = useState(false);
  const [clickedMember, setClickedMember] = useState<ClickedMemberInfo | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { _id: userId } = useContext(LoggedInUserContext)!;
  const participants = useContext(ParticipantsContext)!;
  const selectedChat = useContext(SelectedChatContext);
  const { getChatName, getChatProfile, getUserBio } = useGetParticipantsInfo(participants, userId);
  const currentChatParticipants = useMemo((): Participants => {
    if (!selectedChat) return [];
    return selectedChat.participants.map(p => participants[p]);
  }, [participants, selectedChat]);
  const { 
    loading, 
    removeFromGroup, 
    createOneToOneChat, 
    toggleAdmin,
    leaveGroup
  } = useChatActions(userId);

  const isLoggedInUserAdmin = useMemo(() => {
    if (!selectedChat) return false;
    return selectedChat.admins.includes(userId);
  }, [selectedChat, userId]);

  const handleSelectedChat = useSetSelectedChat();
  const {
    whenAdminToggled,
    whenParticipantRemoved,
  } = useChatDetailsUpdates();
  const {
    emitAdminToggle,
    emitParticipantRemove,
    emitLeaveGroup
  } = useChatDetailsSocketEmits();

  const handleDetailClose = () => {
    dispatch(setIsDetailsOn(false));
  }
  const handleMemberClick = useCallback(
    (userData: ClickedMemberInfo) => {
      if (userData.memberId === userId) return
      setClickedMember(userData);
    },
    [setClickedMember],
  );

  const handleMessageMember = async () => {
    if (!clickedMember) return;
    const response = await createOneToOneChat(clickedMember.memberId);
    if (!response) return;
    if (response.participants && response.participants.length) {
      dispatch(addToChatState({ chats: [response.chat], participants: response.participants }));
    }
    handleSelectedChat(response.chat);
    setClickedMember(null);
  }

  const handleToggleAdmin = async () => {
    if (!clickedMember || !selectedChat) return;
    const response = await toggleAdmin(selectedChat._id, clickedMember.memberId);
    if (response) {
      whenAdminToggled(selectedChat._id, clickedMember.memberId, dispatch);
      emitAdminToggle(selectedChat._id, clickedMember.memberId, selectedChat.participants);
    }
    setClickedMember(null);
  }
  const handleRemoveParticipant = async () => {
    if (!clickedMember || !selectedChat) return;
    const response = await removeFromGroup(selectedChat._id, clickedMember.memberId);
    if (response) {
      whenParticipantRemoved(selectedChat._id, clickedMember.memberId, dispatch);
      emitParticipantRemove(selectedChat._id, clickedMember.memberId, selectedChat.participants);
    }
    setClickedMember(null);
  }

  const handleLeaveGroup = async() => {
    if (!selectedChat) return;
    const response = await leaveGroup(selectedChat._id);
    if (response) {
      dispatch(removeChat(selectedChat._id));
      handleSelectedChat(null);
      emitLeaveGroup(selectedChat._id, response);
    }
  }

  console.log("CHAT DETAILS rendering..." + Math.random());
  return (
    <div className={cn('relative bg-primary-4 dark:bg-dark-2 w-full h-full md:rounded-md', className)}>
      <CreateGroupChatModal
        isOpen={addParticipantsModal}
        onClose={setAddParticipantsModal}
        isAddParticipant={true}
      />
      <Dialog 
        open={clickedMember !== null} 
        onOpenChange={() => {
          if(loading){
            toast.warning("Wait a second...");
            return;
          }
          setClickedMember(null)
        }}
        
      >
        <DialogContent className="sm:max-w-[425px]">
          <VisuallyHidden>
            <DialogDescription />
          </VisuallyHidden>
          <DialogTitle>Actions</DialogTitle>
          <div>
            {clickedMember && <div>
              <p onClick={handleMessageMember} className={getJITBtnStyle}>Message {clickedMember.name}</p>
              <p onClick={() => navigate(`/user/${clickedMember.memberId}`)} className={getJITBtnStyle}>View {clickedMember.name}</p>
              {isLoggedInUserAdmin && <>
                <p onClick={handleToggleAdmin} className={getJITBtnStyle}>{clickedMember.isAdmin ? "Demote from" : "Promote to"} admin</p>
                <p onClick={handleRemoveParticipant} className={getJITBtnStyle}>Remove {clickedMember.name}</p>
              </>}
            </div>}
            <div className='mt-3'>
              {loading && <Loader />}
            </div>
          </div>
          <DialogFooter />
        </DialogContent>
      </Dialog>
      <div className='flex items-center justify-between px-5 py-2'>
        <p className='text-xl font-bold'>Chat Details</p>
        <XIcon className='w-6 h-6 cursor-pointer' onClick={handleDetailClose} />
      </div>
      <div className='absolute top-10 w-full left-0 bottom-0 overflow-auto p-2 flex flex-col items-center space-y-2'>
        {
          !selectedChat ?
            <div className='mt-28'>
              <p className='text-xl font-bold'>No chat is selected</p>
            </div> : <>
              <div className='space-y-2 flex flex-col items-center'>
                <Avatar className='w-40 h-40 md:w-56 md:h-56 lg:w-64 lg:h-64'>
                  <AvatarImage className='object-cover' src={getChatProfile(selectedChat)} alt="user|group" />
                  <AvatarFallback>GSP</AvatarFallback>
                </Avatar>
                <div>
                  <p className='text-2xl font-bold text-center'>{getChatName(selectedChat)}</p>
                </div>
              </div>
              {selectedChat.chatType === "one-to-one" && <p className='w-full bg-primary-1 dark:bg-dark-3 p-2 rounded-sm text-lg '>{getUserBio(selectedChat)}</p>}
              {
                selectedChat.chatType === "group" && <>
                  <UpdateGroupModal
                    isOpen={updateGroupModal}
                    onClose={setUpdateGroupModal}
                  />
                  <p className='text-sm text-center'>{selectedChat.participants.length} members</p>
                  {isLoggedInUserAdmin && <div className='w-full flex flex-wrap items-center justify-center gap-1'>
                    <Button
                      className='bg-success dark:bg-primary-3 text-dark-1'
                      onClick={() => setAddParticipantsModal(true)}
                    >
                      <Plus className='w-5 h-5 mr-1' /> Add
                    </Button>
                    <Button
                      className='bg-success dark:bg-primary-3 text-dark-1'
                      onClick={() => setUpdateGroupModal(true)}
                    >
                      <PencilIcon className='w-5 h-5 mr-1' /> Update Name & Icon
                    </Button>
                  </div>}
                  <div className='w-full'>
                    <p className='text-lg font-bold'>Members</p>
                    {
                      currentChatParticipants.map(p => (
                        <GroupMemberCard
                          key={p._id}
                          bio={p.bio}
                          name={p.name}
                          userId={p._id}
                          profilePic={p.profilePic}
                          isAdmin={selectedChat.admins.includes(p._id)}
                          handleClick={handleMemberClick}
                        />
                      ))
                    }
                  </div>
                  <div className='w-full flex justify-center mt-2'>
                    <MyAlert
                      alertTriggerComponent={
                        <Button
                          className='bg-danger hover:bg-[red] text-dark-1'
                        >
                          <LogOutIcon className='w-5 h-5 mr-1' /> Leave Group
                        </Button>
                      }
                      title="Leave Group"
                      description="Are you sure you want to leave this group?"
                      okText="Leave"
                      okHandler={handleLeaveGroup}
                      loading={loading}
                      okBtnClassName='bg-danger hover:bg-[red] dark:bg-danger dark:hover:bg-danger'
                    />
                  </div>
                </>
              }
            </>
        }
      </div>
    </div>
  )
}

export default memo(ChatDetails)