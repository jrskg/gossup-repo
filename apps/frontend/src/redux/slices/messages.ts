import { IChat, IMessage } from "@/interface/chatInterface";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import { addToChatState, appendToChatState } from "./chats";
import { IMessageStatusUpdatePayload } from "@/interface/socketEvents";

interface IChatMessages{
  // page: number;
  cursor: string;
  hasMore: boolean;
  seenMessages: Record<string, IMessage>;
  newMessages: Record<string, IMessage>;
  seenMessagesIds: string[];
  newMessagesIds: string[];
}
export type Messages = Record<string, IChatMessages>
interface IMessagesState {
  messages: Messages
}
const initialState:IMessagesState = {
  messages:{}
}

const initilizeMessage = (state:IMessagesState, chats:IChat[]) => {
  chats.forEach(chat => {
    if(!state.messages[chat._id]){
      state.messages[chat._id] = {
        hasMore: true,
        cursor: "",
        seenMessages: {},
        newMessages: {},
        seenMessagesIds: [],
        newMessagesIds: []
      }
    }
  })
}

const messagesSlice = createSlice({
  name:"messages",
  initialState,
  reducers: {

    initilizeMessagesTemp:(state, action:PayloadAction<string[]>) => {
      const chatIds = action.payload;
      chatIds.forEach(chatId => {
        state.messages[chatId] = {
          hasMore: true,
          cursor: "",
          seenMessages: {},
          newMessages: {},
          seenMessagesIds: [],
          newMessagesIds: []
        }
      })
    },
    setMessages:(state, action:PayloadAction<Messages>) => {
      state.messages = {
        ...state.messages,
        ...action.payload
      }
    },
    transferNewToSeen:(state, action:PayloadAction<string>) => {
      const chatId = action.payload;
      const chatMessages = state.messages[chatId];
      if(chatMessages && chatMessages.newMessagesIds.length > 0){
        Object.keys(chatMessages.newMessages).forEach(key => {
          chatMessages.seenMessages[key] = chatMessages.newMessages[key];
        })
        chatMessages.newMessages = {};
        chatMessages.seenMessagesIds = [...chatMessages.newMessagesIds, ...chatMessages.seenMessagesIds]
        chatMessages.newMessagesIds = [];
      }
    },
    addToSeenMessages:(state, action:PayloadAction<{chatId: string, message: IMessage}>) => {
      const {chatId, message} = action.payload;
      const chatMessages = state.messages[chatId];
      if(chatMessages){
        chatMessages.seenMessages[message._id] = message;
        chatMessages.seenMessagesIds.unshift(message._id);
      }
    },
    addToNewMessages:(state, action:PayloadAction<{chatId: string, message: IMessage}>) => {
      const {chatId, message} = action.payload;
      const chatMessages = state.messages[chatId];
      if(chatMessages){
        chatMessages.newMessages[message._id] = message;
        chatMessages.newMessagesIds.unshift(message._id);
      }
    },
    updateMessageStatus:(state, action:PayloadAction<IMessageStatusUpdatePayload[]>) => {
      action.payload.forEach(({messageId, roomId, status}) => {
        const message = state.messages[roomId].seenMessages[messageId];
        if(message){
          message.deliveryStatus = status;
        }
      })
    },
    addMoreMessageOnScroll: (state, action:PayloadAction<{chatId: string, messages: IMessage[], hasMore: boolean}>) => {
      const {chatId, messages, hasMore} = action.payload;
      const chatMessages = state.messages[chatId];
      if(chatMessages && messages.length > 0){
        messages.forEach(message => {
          chatMessages.seenMessages[message._id] = message;
          chatMessages.seenMessagesIds.push(message._id);
        });
        chatMessages.cursor = messages[messages.length - 1]._id;
      }
      chatMessages.hasMore = hasMore;
    }
  },
  extraReducers:(builder) => {
    builder.addCase(addToChatState, (state, action) => {
      const chats = action.payload.chats;
      initilizeMessage(state, chats);
    })
    .addCase(appendToChatState, (state, action) => {
      const chats = action.payload.chats;
      initilizeMessage(state, chats);
    })
  },
});

export const {
  setMessages, 
  transferNewToSeen, 
  addToSeenMessages, 
  addToNewMessages,
  initilizeMessagesTemp,
  updateMessageStatus,
  addMoreMessageOnScroll
} = messagesSlice.actions;
export default messagesSlice.reducer;