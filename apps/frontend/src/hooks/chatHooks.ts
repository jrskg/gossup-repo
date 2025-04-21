import { LastMessageRenderData } from "@/components/chat-ui/ChatCard";
import { ChatsContext } from "@/context/contexts";
import { useSelectedChatRef } from "@/context/selectedChatRefContext";
import { useSocket } from "@/context/socketContext";
import type { IChat, IGetChatsResponse, IGetSingleChatResponse, IMessage, MessagesPerChat, Participants, ParticipantsMap } from "@/interface/chatInterface";
import type { Image, ResponseWithData, ResponseWithoutData } from "@/interface/interface";
import { IMessageStatusUpdatePayload } from "@/interface/socketEvents";
import { setChatState } from "@/redux/slices/chats";
import { initilizeMessagesTemp, Messages, setMessages, transferNewToSeen } from "@/redux/slices/messages";
import { setSelectedChat } from "@/redux/slices/selectedChat";
import instance from "@/utils/axiosInstance";
import { SOCKET_EVENTS } from "@/utils/constants";
import { AxiosError } from "axios";
import { useCallback, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import defaultAvatar from "../assets/defaultAvatar.jpg";
import { useAppDispatch } from "./hooks";

type ChatReturn = {
  chat: IChat,
  participants: Participants
} | null;

const useSetSelectedChat = () => {
  const dispatch = useAppDispatch();
  const selectedChatRef = useSelectedChatRef();
  const { socket } = useSocket();

  const handleSelectedChat = useCallback((chat: IChat | null) => {
    if (selectedChatRef.current?._id !== chat?._id) {
      if (socket) {
        if (chat) {
          socket.emit(SOCKET_EVENTS.JOIN_ROOM, {
            currRoomId: chat._id,
            prevRoomId: selectedChatRef.current?._id || null
          })
        }
        else if (selectedChatRef.current) {
          socket.emit(SOCKET_EVENTS.LEAVE_ROOM, {
            roomId: selectedChatRef.current._id
          })
        }
      }
    }
    if (selectedChatRef.current) dispatch(transferNewToSeen(selectedChatRef.current._id));
    dispatch(setSelectedChat(chat));
    selectedChatRef.current = chat;
  }, [dispatch, socket]);

  return handleSelectedChat
}

const useGetAllChats = (orderedChatIds: string[], loggedInUserId: string) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { socket } = useSocket();

  const parseStoreAndEmit = (messagesPerChat: MessagesPerChat[]) => {
    if (!messagesPerChat || messagesPerChat.length === 0) {
      console.warn("⚠️ No messages to process.");
      return;
    }
    if (!loggedInUserId) {
      console.error("❌ loggedInUserId is undefined");
      return;
    }

    const messagesForStore: Messages = {};
    const messagesToStatusUpdate: Record<string, IMessageStatusUpdatePayload[]> = {};
    messagesPerChat.forEach(({ _id: chatId, messages }) => {
      messagesForStore[chatId] = {
        newMessages: {},
        seenMessages: {},
        newMessagesIds: [],
        seenMessagesIds: [],
        cursor: "",
        hasMore: true
      };

      messages.forEach(message => {
        if (message.senderId !== loggedInUserId && message.deliveryStatus === "sent") {
          messagesForStore[chatId].newMessages[message._id] = message;
          messagesForStore[chatId].newMessagesIds.push(message._id);

          if (!messagesToStatusUpdate[message.chatId]) {
            messagesToStatusUpdate[message.chatId] = [];
          }

          messagesToStatusUpdate[message.chatId].push({
            messageId: message._id,
            status: "delivered",
            roomId: message.chatId,
            senderId: message.senderId
          });
        } else {
          messagesForStore[chatId].seenMessages[message._id] = message;
          messagesForStore[chatId].seenMessagesIds.push(message._id);
        }
      });
      // messagesForStore[chatId].newMessagesIds.reverse();
      // messagesForStore[chatId].seenMessagesIds.reverse();
      messagesForStore[chatId].cursor = messages.length > 0 ? messages[messages.length - 1].createdAt : "";
    });

    dispatch(setMessages(messagesForStore));

    if (socket) {
      Object.values(messagesToStatusUpdate).forEach(updates => {
        if (updates.length > 0) {
          socket.emit(SOCKET_EVENTS.MESSAGE_STATUS_UPDATE, updates);
        }
      })
    }
  };

  const getAllChats = async () => {
    try {
      setLoading(true);
      const { data } = await instance.get<ResponseWithData<IGetChatsResponse>>(`/chat/all`);
      if (data.success) {
        dispatch(setChatState({ chats: data.data.chats, participants: data.data.participants }));
        dispatch(initilizeMessagesTemp(data.data.chats.map(ch => ch._id)));
        parseStoreAndEmit(data.data.messagesPerChat);
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (orderedChatIds.length === 0) getAllChats();
  }, []);

  return {
    loading,
  }
}
const useGetParticipantsInfo = (participants: ParticipantsMap, userId: string) => {
  const getChatName = (chat: IChat): string => {
    if (chat.chatType === "group") return chat.groupName;
    const participantId = chat.participants[0] === userId ? chat.participants[1] : chat.participants[0];
    const name = participants[participantId].name;
    return name;
  }

  const getChatAvatar = (chat: IChat): string => {
    if (chat.chatType === "group") return chat.groupIcon ? chat.groupIcon.avatar : defaultAvatar;
    const pId = chat.participants.find(p => p !== userId)!;
    const avatar = participants[pId].profilePic;
    return avatar ? avatar.avatar : defaultAvatar;
  }

  const getChatProfile = (chat: IChat): string => {
    if (chat.chatType === "group") return chat.groupIcon ? chat.groupIcon.image : defaultAvatar;
    const pId = chat.participants.find(p => p !== userId)!;
    const profile = participants[pId].profilePic;
    return profile ? profile.image : defaultAvatar;
  }

  const getUserBio = (chat: IChat): string => {
    const pId = chat.participants.find(p => p !== userId)!;
    return participants[pId].bio
  }
  const getLastMessageText = (chat: IChat, lastMessage?: IMessage): LastMessageRenderData|null => {
    if (!lastMessage) return null;
    if(chat.chatType === "group"){
      let str1 = lastMessage.senderId === userId ? "You: " : `${participants[lastMessage.senderId].name}: `
      let textContent = lastMessage.messageType === "text" ? str1 + lastMessage.content?.slice(0, 20) : str1 + "Sent an attachment";
      return{
        message: textContent,
        shouldIcon: false,
        status: lastMessage.deliveryStatus
      }
    }
    return {
      message: lastMessage.messageType === "text" ? lastMessage.content?.slice(0, 20) || "" : "Sent an attachment",
      shouldIcon: lastMessage.senderId === userId,
      status: lastMessage.deliveryStatus
    }
  }

  return {
    getChatAvatar,
    getChatName,
    getChatProfile,
    getUserBio,
    getLastMessageText
  }
}

const useChatActions = (loggedInUserId: string) => {
  const [loading, setLoading] = useState(false);
  const { chatMap, orderedChatIds } = useContext(ChatsContext)!;
  const createOneToOneChat = async (userId: string): Promise<ChatReturn> => {
    const chatId = orderedChatIds.find(chid => {
      const ch = chatMap[chid];
      return (ch.chatType === "one-to-one" && ch.participants.includes(userId) && ch.participants.includes(loggedInUserId))
    });
    const chat = chatId ? chatMap[chatId] : null;

    if (chat) {
      return {
        chat,
        participants: []
      };
    }
    try {
      setLoading(true);
      const { data } = await instance.post<ResponseWithData<IGetSingleChatResponse>>("/chat/one-to-one", { userId });
      if (data.success) {
        return {
          chat: data.data.chatData,
          participants: data.data.participants
        };
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      }
    } finally { setLoading(false) }
    return null;
  }

  const toggleAdmin = async (groupId: string, participantId: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { data } = await instance.put<ResponseWithoutData>("/chat/group/admin", { groupId, participantId });
      if (data.success) {
        toast.success(data.message);
        return true;
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      }
    } finally { setLoading(false) }
    return false;
  }

  const removeFromGroup = async (groupId: string, participantId: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { data } = await instance.delete<ResponseWithoutData>(`/chat/group/participant?groupId=${groupId}&participantId=${participantId}`);
      if (data.success) {
        toast.success(data.message);
        return true;
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      }
    } finally { setLoading(false) }
    return false;
  }
  const leaveGroup = async (groupId: string): Promise<IChat | null> => {
    try {
      setLoading(true);
      const { data } = await instance.delete<ResponseWithData<IChat>>(`/chat/group/leave?groupId=${groupId}`);
      if (data.success) {
        toast.info(data.message);
        return data.data;
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      }
    } finally { setLoading(false) }
    return null;
  }
  return {
    toggleAdmin,
    removeFromGroup,
    loading,
    createOneToOneChat,
    chatMap,
    leaveGroup
  }
}

const useCreateGroupChat = () => {
  const [loading, setLoading] = useState(false);

  const createGroupChat = async (groupName: string, participants: string[]): Promise<ChatReturn> => {
    try {
      setLoading(true);
      const { data } = await instance.post<ResponseWithData<IGetSingleChatResponse>>("/chat/group", { groupName, participants });
      if (data.success) {
        toast.success(data.message);
        return {
          chat: data.data.chatData,
          participants: data.data.participants
        }
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      }
      return null;
    } finally { setLoading(false) }
    return null;
  }

  const addMembersToGroupChat = async (groupId: string, participants: string[]): Promise<Participants | null> => {
    try {
      setLoading(true);
      const { data } = await instance.put<ResponseWithData<{ participants: Participants }>>("/chat/group/participant", { groupId, participants });
      if (data.success) {
        toast.success(data.message);
        return data.data.participants;
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      }
      return null;
    } finally { setLoading(false) }
    return null;
  }

  return {
    addMembersToGroupChat,
    createGroupChat,
    loading
  }
}

const useUpdateGroupChat = (groupId: string) => {
  const [imageLoading, setImageLoading] = useState(false);
  const [nameLoading, setNameLoading] = useState(false);
  const [uploadPercentage, setUploadPercentage] = useState(0);

  const uploadGroupIcon = async (imageFile: File): Promise<Image | null> => {
    const formData = new FormData();
    formData.append("groupId", groupId);
    formData.append("groupIcon", imageFile);
    try {
      setImageLoading(true);
      setUploadPercentage(0);
      const { data } = await instance.put<ResponseWithData<Image>>("/chat/group/icon", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadPercentage(progress);
        }
      });
      if (data.success) {
        setUploadPercentage(100);
        toast.success(data.message);
        return data.data;
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      }
      return null;
    } finally { setImageLoading(false) }
    return null;
  }

  const updateGroupName = async (groupName: string): Promise<boolean> => {
    try {
      setNameLoading(true);
      const { data } = await instance.put<ResponseWithoutData>("/chat/group/name", { groupName, groupId });
      if (data.success) {
        toast.success(data.message);
        return true;
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      }
    } finally { setNameLoading(false) }
    return false;
  }

  return {
    imageLoading,
    nameLoading,
    uploadPercentage,
    uploadGroupIcon,
    updateGroupName
  }
}

export {
  useChatActions, useCreateGroupChat, useGetAllChats,
  useGetParticipantsInfo, useSetSelectedChat, useUpdateGroupChat
};

