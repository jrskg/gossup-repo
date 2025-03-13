import type { ChatMap, IChat, ParticipantsMap } from "@/interface/chatInterface";
import type { IUser } from "@/interface/interface";
import type { Messages } from "@/redux/slices/messages";
import { createContext } from "react";

export const LoggedInUserContext = createContext<IUser | null>(null);
export const SelectedChatContext = createContext<IChat | null>(null);
export const ChatsContext = createContext<{chatMap:ChatMap, orderedChatIds:string[]} | null>(null);
export const ParticipantsContext = createContext<ParticipantsMap | null>(null);
export const MessagesContext = createContext<Messages | null>(null);