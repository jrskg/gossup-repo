import { useSocket } from "@/context/socketContext"
import type { ChatMap, IChat, IGetSingleChatResponse, Participants, ParticipantsMap } from "@/interface/chatInterface";
import { IUser, ResponseWithData } from "@/interface/interface";
import { SOCKET_EVENTS } from "@/utils/constants";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAppDispatch } from "./hooks";
import { addToNewMessages, addToSeenMessages, transferNewToSeen, updateMessageStatus } from "@/redux/slices/messages";
import { useChatDetailsUpdates } from "./chatDetailsHooks";
import instance from "@/utils/axiosInstance";
import { AxiosError } from "axios";

export const useGlobalSocketListeners = (
  selectedChat: IChat|null, 
  _loggedInUser: IUser|null, 
  chatMap: ChatMap,
  participantMap: ParticipantsMap,
) => {
  const { socket } = useSocket();
  const dispatch = useAppDispatch();
  const {
    whenChatUpdated,
    whenAdminToggled,
    whenParticipantRemoved,
    whenGroupChatCreated,
    whenParticipantsAdded
  } = useChatDetailsUpdates();

  const getParticipantsDetails = async(participants: string[]) => {
    try {
      const {data} = await instance.post<ResponseWithData<Participants>>("/user/users", {users: participants});
      if(data.success){
        return data.data;
      }
    } catch (error) {
      if(error instanceof AxiosError && error.response){
        toast.error(error.response.data.message);
      }
    }
  }

  const getChatById = async(chatId: string) => {
    try {
      const {data} = await instance.get<ResponseWithData<IGetSingleChatResponse>>(`/chat/${chatId}`);
      if(data.success){
        return data.data;
      }
    } catch (error) {
      if(error instanceof AxiosError && error.response){
        toast.error(error.response.data.message);
      }
    }
  }

  useEffect(() => {
    if (!socket) return;
    socket.on(SOCKET_EVENTS.NEW_MESSAGE, (payload) => {
      const { message, roomId } = payload;
      if (!selectedChat || roomId !== selectedChat._id) {
        toast.success("New message received");
        dispatch(addToNewMessages({ chatId: roomId, message }));
        socket.emit(SOCKET_EVENTS.MESSAGE_STATUS_UPDATE, [{
          messageId: message._id,
          status:"delivered",
          roomId,
          senderId: message.senderId
        }]);
      } else {
        dispatch(transferNewToSeen(roomId));
        dispatch(addToSeenMessages({ chatId: roomId, message }));
        socket.emit(SOCKET_EVENTS.MESSAGE_STATUS_UPDATE, [{
          messageId: message._id,
          status:"seen",
          roomId,
          senderId: message.senderId
        }]);
      }
    });

    socket.on(SOCKET_EVENTS.MESSAGE_STATUS_UPDATE, (payload) => {      
      dispatch(updateMessageStatus(payload));
    });

    socket.on(SOCKET_EVENTS.CHAT_NAME_ICON_UPDATE, ({chatId, updatedChat}) => {
      if(!selectedChat || selectedChat._id !== chatId){
        whenChatUpdated(updatedChat, dispatch, false);
      }
      else {
        whenChatUpdated(updatedChat, dispatch);
      }
    });

    socket.on(SOCKET_EVENTS.TOGGLE_ADMIN, ({chatId, participantId}) => {
      if(!selectedChat || selectedChat._id !== chatId){
        whenAdminToggled(chatId, participantId, dispatch, false);
      }else{
        whenAdminToggled(chatId, participantId, dispatch);
      }
    });

    socket.on(SOCKET_EVENTS.REMOVED_PARTICIPANT, ({chatId, participantId}) => {
      if(!selectedChat || selectedChat._id !== chatId){
        whenParticipantRemoved(chatId, participantId, dispatch, false);
      }else{
        whenParticipantRemoved(chatId, participantId, dispatch);
      }
    });

    socket.on(SOCKET_EVENTS.LEAVE_GROUP, ({chatId, updatedChat}) => {
      if(!selectedChat || selectedChat._id !== chatId){
        whenChatUpdated(updatedChat, dispatch, false);
      }else{
        whenChatUpdated(updatedChat, dispatch);
      }
    });

    socket.on(SOCKET_EVENTS.CREATE_OR_ADD_PARTICIPANTS, async({chatId, participants}) => {
      if(chatMap[chatId] && chatMap[chatId]._id){
        //chat exists
        const participantsNeedsToBeLoaded = participants.filter(p => !(participantMap[p] && participantMap[p]._id));
        const updatedChat = {...chatMap[chatId]};
        updatedChat.participants = [...participants];
        let participantsDetails: Participants | undefined = [];
        if(participantsNeedsToBeLoaded.length > 0) {
          participantsDetails = await getParticipantsDetails(participantsNeedsToBeLoaded);
        }
        if(participantsDetails){
          if(!selectedChat || selectedChat._id !== chatId){
            whenParticipantsAdded(updatedChat, participantsDetails, dispatch, false);
          }else{
            whenParticipantsAdded(updatedChat, participantsDetails, dispatch);
          }
        }
      }else{
        //chat not exists
        const response = await getChatById(chatId);
        if(response){
          whenGroupChatCreated(response.chatData, response.participants, dispatch, false);
        }
      }
    })

    return () => {
      socket.off(SOCKET_EVENTS.NEW_MESSAGE);
      socket.off(SOCKET_EVENTS.MESSAGE_STATUS_UPDATE);
      socket.off(SOCKET_EVENTS.CHAT_NAME_ICON_UPDATE);
      socket.off(SOCKET_EVENTS.TOGGLE_ADMIN);
      socket.off(SOCKET_EVENTS.REMOVED_PARTICIPANT);
      socket.off(SOCKET_EVENTS.LEAVE_GROUP);
      socket.off(SOCKET_EVENTS.CREATE_OR_ADD_PARTICIPANTS);
    }
  }, [socket, selectedChat, dispatch]);

}