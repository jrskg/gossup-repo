import {SOCKET_EVENTS} from "../utils/constants";
import type { DeliveryStatus, IChat, IMessage } from "./chatInterface";

export interface IMessageStatusUpdatePayload {
  roomId: string;
  messageId: string;
  status: DeliveryStatus;
  senderId: string;
}

export type SocketEventMap = {
  [SOCKET_EVENTS.JOIN_ROOM]: (payload: { 
    currRoomId: string, 
    prevRoomId: string | null,
  }) => void;
  [SOCKET_EVENTS.LEAVE_ROOM]: (payload: { roomId: string }) => void;
  [SOCKET_EVENTS.SEND_MESSAGE]: (payload:{
    roomId: string, 
    message: IMessage, 
    senderId: string, 
    participants: string[]
  }) => void;
  [SOCKET_EVENTS.NEW_MESSAGE]: (payload:{roomId: string, message: IMessage}) => void;
  [SOCKET_EVENTS.USER_TYPING]: (payload: {roomId: string, userId: string, name: string}) => void;
  [SOCKET_EVENTS.USER_STOP_TYPING]: (payload: {roomId: string, userId: string, name: string}) => void;
  [SOCKET_EVENTS.MESSAGE_STATUS_UPDATE]: (payload: IMessageStatusUpdatePayload[]) => void;
  // [SOCKET_EVENTS.MESSAGE_STATUS_UPDATE_BULK]: (payload: IMessageStatusUpdatePayload[]) => void;

  [SOCKET_EVENTS.CHAT_NAME_ICON_UPDATE]: (payload:{
    chatId: string,
    updatedChat: IChat,
  }) => void;
  [SOCKET_EVENTS.TOGGLE_ADMIN]: (payload:{
    chatId: string,
    participants?: string[], //optional because when listening for this event on client i don't need this array
    participantId: string
  }) => void;
  [SOCKET_EVENTS.REMOVED_PARTICIPANT]: (payload:{
    chatId: string,
    participants?: string[],
    participantId: string
  }) => void;
  [SOCKET_EVENTS.LEAVE_GROUP]: (payload:{
    chatId: string, 
    updatedChat: IChat
  }) => void;
  [SOCKET_EVENTS.CREATE_OR_ADD_PARTICIPANTS]: (payload:{
    chatId: string,
    participants: string[]
  }) => void;
}