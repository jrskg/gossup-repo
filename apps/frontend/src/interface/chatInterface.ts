import type { Image, IUserShort } from "./interface";

//interface for message card
export type MessageType = "text" | "file";
export type FileType = "image" | "video" | "audio" | "other";
export type DeliveryStatus = "sent" | "delivered" | "seen";
export type ChatType = "one-to-one" | "group";
export interface IAttachment{
  fileUrl: string;
  fileType: FileType;
  originalFileName: string;
  size: number;
}
export interface IMessage{
  _id: string;
  chatId: string;
  senderId: string;
  content?: string;
  messageType: MessageType;
  deliveryStatus: DeliveryStatus;
  attachments: IAttachment[];
  createdAt: string;
}
export interface ILastMessage{
  messageType: MessageType;
  content: string;
}
interface IUserShortWithBio extends IUserShort{
  bio:string
}
interface BaseChat {
  _id: string;
  chatType: ChatType;
  participants: string[];
  admins: string[];
  lastMessage?: ILastMessage;
  createdAt: string;
  updatedAt: string;
}

// Conditional type to make `groupName` required for group chats
export interface GroupChat extends BaseChat {
  chatType: "group";
  groupName: string;
  groupIcon?: Image
}

export interface OneToOneChat extends BaseChat {
  chatType: "one-to-one";
  groupName?: never;
  groupIcon?: never
}

export type Participants = IUserShortWithBio[];
export type ParticipantsMap = Record<string, IUserShortWithBio>;
export type ChatMap = Record<string, IChat>;

export interface MessagesPerChat{
  _id: string; //chatId
  messages: IMessage[]
}
export interface IGetChatsResponse{
  chats: IChat[];
  participants: Participants;
  messagesPerChat: MessagesPerChat[]
}

export interface IGetSingleChatResponse{
  chatData: IChat;
  participants: Participants
}
export type IChat = GroupChat | OneToOneChat;
//upto here