import { useSocket } from "@/context/socketContext"
import type {
  ChatMap,
  DeliveryStatus,
  IChat,
  IGetSingleChatResponse,
  IMessage,
  Participants,
  ParticipantsMap
} from "@/interface/chatInterface";
import { IUser, ResponseWithData } from "@/interface/interface";
import { SOCKET_EVENTS } from "@/utils/constants";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "./hooks";
import { addToNewMessages, addToSeenMessages, transferNewToSeen, updateMessageStatus } from "@/redux/slices/messages";
import { useChatDetailsUpdates } from "./chatDetailsHooks";
import instance from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import { addToChatState } from "@/redux/slices/chats";
import { FriendStory } from "@/interface/storyInterface";
import { addReactionToMyStory, addToFriendStories, deleteFromFriendStories, updateMyStoriesViews } from "@/redux/slices/story";
import { useGetStory } from "./useStory";
import { playSound } from "@/utils/audio";
import chinSound from "../assets/chinSound.mp3"
import messageAlert from "../assets/messageAlert.wav"

export const useGlobalSocketListeners = (
  selectedChat: IChat | null,
  _loggedInUser: IUser | null,
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

  const { loadStories } = useGetStory();

  const {
    status: storyFetchedStatus,
  } = useAppSelector(state => state.story);

  const getParticipantsDetails = useCallback(async (participants: string[]) => {
    try {
      const { data } = await instance.post<ResponseWithData<Participants>>("/user/users", { users: participants });
      if (data.success) {
        return data.data;
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      }
    }
  }, []);

  const getChatById = useCallback(async (chatId: string) => {
    try {
      const { data } = await instance.get<ResponseWithData<IGetSingleChatResponse>>(`/chat/${chatId}`);
      if (data.success) {
        return data.data;
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      }
    }
  }, []);
  const emitStatusUpdate = useCallback((message: IMessage, status: DeliveryStatus, roomId: string) => {
    if (socket) {
      socket.emit(SOCKET_EVENTS.MESSAGE_STATUS_UPDATE, [{
        messageId: message._id,
        status,
        roomId,
        senderId: message.senderId
      }]);
    }
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    socket.on(SOCKET_EVENTS.NEW_MESSAGE, async (payload) => {
      const { message, roomId } = payload;
      if (!chatMap[roomId]) {
        const createdChat = await getChatById(roomId);
        if (createdChat) {
          dispatch(addToChatState({ chats: [createdChat.chatData], participants: createdChat.participants }));
          dispatch(addToNewMessages({ chatId: roomId, message }));
          emitStatusUpdate(message, "delivered", roomId);
        }
        playSound(chinSound);
      }
      else if (!selectedChat || roomId !== selectedChat._id) {
        // toast.success("New message received");
        dispatch(addToNewMessages({ chatId: roomId, message }));
        emitStatusUpdate(message, "delivered", roomId);
        playSound(chinSound);
      } else {
        dispatch(transferNewToSeen(roomId));
        dispatch(addToSeenMessages({ chatId: roomId, message }));
        emitStatusUpdate(message, "seen", roomId);
        playSound(messageAlert);
      }
    });

    socket.on(SOCKET_EVENTS.MESSAGE_STATUS_UPDATE, (payload) => {
      dispatch(updateMessageStatus(payload));
    });

    socket.on(SOCKET_EVENTS.CHAT_NAME_ICON_UPDATE, ({ chatId, updatedChat }) => {
      if (!selectedChat || selectedChat._id !== chatId) {
        whenChatUpdated(updatedChat, dispatch, false);
      }
      else {
        whenChatUpdated(updatedChat, dispatch);
      }
    });

    socket.on(SOCKET_EVENTS.TOGGLE_ADMIN, ({ chatId, participantId }) => {
      if (!selectedChat || selectedChat._id !== chatId) {
        whenAdminToggled(chatId, participantId, dispatch, false);
      } else {
        whenAdminToggled(chatId, participantId, dispatch);
      }
    });

    socket.on(SOCKET_EVENTS.REMOVED_PARTICIPANT, ({ chatId, participantId }) => {
      if (!selectedChat || selectedChat._id !== chatId) {
        whenParticipantRemoved(chatId, participantId, dispatch, false);
      } else {
        whenParticipantRemoved(chatId, participantId, dispatch);
      }
    });

    socket.on(SOCKET_EVENTS.LEAVE_GROUP, ({ chatId, updatedChat }) => {
      if (!selectedChat || selectedChat._id !== chatId) {
        whenChatUpdated(updatedChat, dispatch, false);
      } else {
        whenChatUpdated(updatedChat, dispatch);
      }
    });

    socket.on(SOCKET_EVENTS.CREATE_OR_ADD_PARTICIPANTS, async ({ chatId, participants }) => {
      if (chatMap[chatId] && chatMap[chatId]._id) {
        //chat exists
        const participantsNeedsToBeLoaded = participants.filter(p => !(participantMap[p] && participantMap[p]._id));
        const updatedChat = { ...chatMap[chatId] };
        updatedChat.participants = [...participants];
        let participantsDetails: Participants | undefined = [];
        if (participantsNeedsToBeLoaded.length > 0) {
          participantsDetails = await getParticipantsDetails(participantsNeedsToBeLoaded);
        }
        if (participantsDetails) {
          if (!selectedChat || selectedChat._id !== chatId) {
            whenParticipantsAdded(updatedChat, participantsDetails, dispatch, false);
          } else {
            whenParticipantsAdded(updatedChat, participantsDetails, dispatch);
          }
        }
      } else {
        //chat not exists
        const response = await getChatById(chatId);
        if (response) {
          whenGroupChatCreated(response.chatData, response.participants, dispatch, false);
        }
      }
    });

    socket.on(SOCKET_EVENTS.FRIEND_CREATE_STORY, async ({ story, user }) => {
      if (storyFetchedStatus === "notcalled") {
        //simply fetch stories
        loadStories();
      } else {
        const baseStory = { ...story, views: undefined };
        const newStory: FriendStory = {
          ...baseStory,
          user,
          hasViewed: false,
          reactions: [],
        }
        dispatch(addToFriendStories(newStory));
      }
    });

    socket.on(SOCKET_EVENTS.SEEN_FRIEND_STORY, async (payload) => {
      const { storyId, storyView } = payload;
      if (storyFetchedStatus === "notcalled") {
        //simply fetch stories
        loadStories();
      } else {
        dispatch(updateMyStoriesViews({ storyId, view: storyView }));
      }
    })

    socket.on(SOCKET_EVENTS.REACTED_ON_FRIEND_STORY, async (payload) => {
      const { storyId, reactions, userId } = payload;
      if (storyFetchedStatus === "notcalled") {
        //simply fetch stories
        loadStories();
      } else {
        dispatch(addReactionToMyStory({ reactions, storyId, userId }))
      }
    });

    socket.on(SOCKET_EVENTS.FRIEND_DELETED_STORY, ({storyId, storyOwnerId}) => {
      if(storyFetchedStatus === "called"){
        dispatch(deleteFromFriendStories({friendId: storyOwnerId, storyId}));
      }
    });

    return () => {
      socket.off(SOCKET_EVENTS.NEW_MESSAGE);
      socket.off(SOCKET_EVENTS.MESSAGE_STATUS_UPDATE);
      socket.off(SOCKET_EVENTS.CHAT_NAME_ICON_UPDATE);
      socket.off(SOCKET_EVENTS.TOGGLE_ADMIN);
      socket.off(SOCKET_EVENTS.REMOVED_PARTICIPANT);
      socket.off(SOCKET_EVENTS.LEAVE_GROUP);
      socket.off(SOCKET_EVENTS.CREATE_OR_ADD_PARTICIPANTS);
      socket.off(SOCKET_EVENTS.FRIEND_CREATE_STORY);
      socket.off(SOCKET_EVENTS.SEEN_FRIEND_STORY);
      socket.off(SOCKET_EVENTS.REACTED_ON_FRIEND_STORY);
      socket.off(SOCKET_EVENTS.FRIEND_DELETED_STORY);
    }
  }, [socket, selectedChat, dispatch, chatMap, participantMap, whenChatUpdated, whenAdminToggled, whenParticipantRemoved, whenGroupChatCreated, whenParticipantsAdded, loadStories, storyFetchedStatus, emitStatusUpdate, getParticipantsDetails, getChatById]);
}