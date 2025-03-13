import { ChatsContext } from "@/context/contexts";
import type { IChat, IGetChatsResponse, IGetSingleChatResponse, Participants, ParticipantsMap } from "@/interface/chatInterface";
import type { Image, ResponseWithData, ResponseWithoutData } from "@/interface/interface";
import { appendToChatState, setChatState } from "@/redux/slices/chats";
import instance from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import defaultAvatar from "../assets/defaultAvatar.jpg";
import { useAppDispatch } from "./hooks";
import { useInfiniteScroll } from "./useInfiniteScroll";
import { useSelectedChatRef } from "@/context/selectedChatRefContext";
import { useSocket } from "@/context/socketContext";
import { setSelectedChat } from "@/redux/slices/selectedChat";
import { SOCKET_EVENTS } from "@/utils/constants";
import { initilizeMessagesTemp, transferNewToSeen } from "@/redux/slices/messages";

type ChatReturn = {
  chat: IChat,
  participants: Participants
} | null;

const useSetSelectedChat = () => {
  const dispatch = useAppDispatch();
  const selectedChatRef = useSelectedChatRef();
  const { socket } = useSocket();

  const handleSelectedChat = (chat: IChat | null) => {
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
  }

  return handleSelectedChat
}

const useGetAllChats = (orderedChatIds: string[], rootElement: React.MutableRefObject<HTMLDivElement | null>) => {
  const [loading, setLoading] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const { setLastElement } = useInfiniteScroll({
    root: rootElement.current,
    threshold: 0.5,
    isLoading: moreLoading,
    hasMore,
    onLoadMore: async () => {
      setPage(prevPage => prevPage + 1);
      await getAllChats(page + 1);
    }
  })

  const getAllChats = async (page: number) => {
    try {
      if (page === 1) setLoading(true);
      else setMoreLoading(true);
      const { data } = await instance.get<ResponseWithData<IGetChatsResponse>>(`/chat/all?page=${page}`);
      if (data.success) {
        if (page === 1) dispatch(setChatState({ chats: data.data.chats, participants: data.data.participants }));
        else dispatch(appendToChatState({ chats: data.data.chats, participants: data.data.participants }));
        setHasMore(data.data.hasMore);
        dispatch(initilizeMessagesTemp(data.data.chats.map(ch => ch._id)));
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      }
    } finally {
      if (page === 1) setLoading(false);
      else setMoreLoading(false);
    }
  }
  useEffect(() => {
    if (orderedChatIds.length === 0) getAllChats(1);
  }, []);

  return {
    loading,
    moreLoading,
    setLastElement,
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

  return {
    getChatAvatar,
    getChatName,
    getChatProfile,
    getUserBio
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
  useGetParticipantsInfo, useUpdateGroupChat,
  useSetSelectedChat
};

