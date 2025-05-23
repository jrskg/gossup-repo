import {SOCKET_EVENTS} from "../utils/constants";
import { ICall } from "./callInterface";
import type { DeliveryStatus, IChat, IMessage } from "./chatInterface";
import { IUserShort } from "./interface";
import { MyStory, ReactionType, StoryView } from "./storyInterface";
import { CallType } from "./webRtcInterface";

export interface IMessageStatusUpdatePayload {
  roomId: string;
  messageId: string;
  status: DeliveryStatus;
  senderId: string;
}

export type SocketEventMap = {
  [SOCKET_EVENTS.JOIN_ROOM]: (payload: { 
    currRoomId: string; 
    prevRoomId: string | null;
  }) => void;
  [SOCKET_EVENTS.LEAVE_ROOM]: (payload: { roomId: string }) => void;
  [SOCKET_EVENTS.SEND_MESSAGE]: (payload:{
    roomId: string; 
    message: IMessage; 
    senderId: string; 
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



  [SOCKET_EVENTS.I_CREATE_STORY]: (payload:{
    story: MyStory,
  }) => void;
  [SOCKET_EVENTS.FRIEND_CREATE_STORY]: (payload:{
    story: MyStory,
    user: IUserShort,
  }) => void;
  [SOCKET_EVENTS.SEEN_FRIEND_STORY]: (payload:{
    storyId: string,
    storyView: StoryView,
    storyOwnerId: string,
  }) => void;
  [SOCKET_EVENTS.REACTED_ON_FRIEND_STORY]: (payload:{
    storyId: string,
    reactions: ReactionType[],
    userId: string;
    storyOwnerId: string,
  }) => void;
  [SOCKET_EVENTS.DELETED_MY_STORY]: (payload:{
    storyId: string,
    storyOwnerId: string,
  }) => void;
  [SOCKET_EVENTS.FRIEND_DELETED_STORY]: (payload:{
    storyId: string,
    storyOwnerId: string,
  }) => void;


  [SOCKET_EVENTS.CALL_MADE]: (payload:{
    from: IUserShort,
    to: IUserShort,
    offer: RTCSessionDescriptionInit,
    callType: CallType,
    receiverId: string,
    callLog: ICall
  }) => void;

  [SOCKET_EVENTS.CALL_ACCEPTED]: (payload:{
    from: IUserShort,
    to: IUserShort,
    answer: RTCSessionDescriptionInit,
    callType: CallType,
    receiverId: string,
  }) => void;

  [SOCKET_EVENTS.ICE_CANDIDATE]: (payload:{
    from: string,
    to: string,
    receiverId: string,
    candidate: RTCIceCandidateInit,
  }) => void;

  [SOCKET_EVENTS.CALL_ENDED]: (payload:{
    from: string,
    to: string,
    receiverId: string,
  }) => void;

  [SOCKET_EVENTS.CALL_REJECTED]: (payload:{
    from: string,
    to: string,
    receiverId: string,
  }) => void;

  [SOCKET_EVENTS.CALL_RINGING]: (payload:{
    from: string,
    to: string,
    receiverId: string,
  }) => void;

  [SOCKET_EVENTS.USER_BUSY]: (payload:{
    from: string,
    to: string,
    receiverId: string,
  }) => void;

  [SOCKET_EVENTS.MISSED_CALL]: (payload:{
    from: string,
    to: string,
    receiverId: string,
    callInfo: ICall
  }) => void;

  [SOCKET_EVENTS.TOGGLE_VIDEO]: (payload:{
    from: string,
    to: string,
    receiverId: string,
    isVideoOn: boolean
  }) => void;

  [SOCKET_EVENTS.TOGGLE_AUDIO]: (payload:{
    from: string,
    to: string,
    receiverId: string,
    isAudioOn: boolean
  }) => void;
}