import { IChat, Participants } from "@/interface/chatInterface"
import { AppDispatch } from "@/redux/store"
import { useSetSelectedChat } from "./chatHooks"
import { addParticipant, addToChatState, removeParticipantFromChatState, toggleAdminInChatState, updateChat } from "@/redux/slices/chats";
import { removeParticipantFromSelectedChat, toggleAdminInSelectedChat } from "@/redux/slices/selectedChat";
import { useSocket } from "@/context/socketContext";
import { SOCKET_EVENTS } from "@/utils/constants";

const useChatDetailsUpdates = () => {
  //Created this hook because of resuability we need to update the chat details locally and via socket events 
  const handleSelectedChat = useSetSelectedChat();
  const whenChatUpdated = (updatedChat:IChat, dispatch:AppDispatch, isCurrentChat = true) => {
    if(isCurrentChat) {handleSelectedChat(updatedChat);}
    dispatch(updateChat(updatedChat));
  }

  const whenAdminToggled = (chatId: string, participantId: string, dispatch: AppDispatch, isCurrentChat = true) => {
    dispatch(toggleAdminInChatState({chatId, participantId}));
    if(isCurrentChat) {dispatch(toggleAdminInSelectedChat(participantId));}
  }

  const whenParticipantRemoved = (chatId: string, participantId: string, dispatch: AppDispatch, isCurrentChat = true) => {
    dispatch(removeParticipantFromChatState({chatId, participantId}));
    if(isCurrentChat) {dispatch(removeParticipantFromSelectedChat(participantId));}
  }

  const whenGroupChatCreated = (chat: IChat, participants: Participants, dispatch: AppDispatch, isCurrentChat = true) => {
    dispatch(addToChatState({chats: [chat], participants}));
    if (isCurrentChat) handleSelectedChat(chat);
  }
  const whenParticipantsAdded = (chat: IChat, participants: Participants, dispatch: AppDispatch, isCurrentChat = true) => {
    dispatch(updateChat(chat));
    dispatch(addParticipant(participants));
    if (isCurrentChat) handleSelectedChat(chat);
  }

  return {
    whenChatUpdated,
    whenAdminToggled,
    whenParticipantRemoved,
    whenGroupChatCreated,
    whenParticipantsAdded
  }
}

const useChatDetailsSocketEmits = () => {
  const {socket} = useSocket();
  const emitNameAndIconChange = (updatedChat: IChat) => {
    if(!socket) return;
    socket.emit(SOCKET_EVENTS.CHAT_NAME_ICON_UPDATE, {
      chatId: updatedChat._id,
      updatedChat
    });
  }
  const emitAdminToggle = (chatId: string, participantId: string, participants: string[]) => {
    if(!socket) return;
    socket.emit(SOCKET_EVENTS.TOGGLE_ADMIN, {
      chatId,
      participantId,
      participants
    });
  } 
  const emitParticipantRemove = (chatId: string, participantId: string, participants: string[]) => {
    if(!socket) return;
    socket.emit(SOCKET_EVENTS.REMOVED_PARTICIPANT, {
      chatId,
      participantId,
      participants
    });
  } 
  const emitLeaveGroup = (chatId: string, updatedChat: IChat) => {
    if(!socket) return;
    socket.emit(SOCKET_EVENTS.LEAVE_GROUP, {
      chatId,
      updatedChat
    });
  } 
  const emitCreateOrAddParticipants = (chatId: string, participants: string[]) => {
    if(!socket) return;
    socket.emit(SOCKET_EVENTS.CREATE_OR_ADD_PARTICIPANTS, {
      chatId,
      participants,
    });
  }
  return {
    emitNameAndIconChange,
    emitAdminToggle,
    emitParticipantRemove,
    emitLeaveGroup,
    emitCreateOrAddParticipants
  }
}

export {
  useChatDetailsUpdates,
  useChatDetailsSocketEmits
}