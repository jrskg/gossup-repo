import { IChat, IMessage } from "@/interface/chatInterface";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import { addToChatState, appendToChatState } from "./chats";
import { IMessageStatusUpdatePayload } from "@/interface/socketEvents";

interface IChatMessages{
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
          seenMessages: {},
          newMessages: {},
          seenMessagesIds: [],
          newMessagesIds: []
        }
      })
    },
    setMessages:(state, action:PayloadAction<Messages>) => {
      state.messages = action.payload;
    },
    transferNewToSeen:(state, action:PayloadAction<string>) => {
      const chatId = action.payload;
      const chatMessages = state.messages[chatId];
      if(chatMessages && chatMessages.newMessagesIds.length > 0){
        Object.keys(chatMessages.newMessages).forEach(key => {
          chatMessages.seenMessages[key] = chatMessages.newMessages[key];
        })
        chatMessages.newMessages = {};
        chatMessages.seenMessagesIds.push(...chatMessages.newMessagesIds);
        chatMessages.newMessagesIds = [];
      }
    },
    addToSeenMessages:(state, action:PayloadAction<{chatId: string, message: IMessage}>) => {
      const {chatId, message} = action.payload;
      const chatMessages = state.messages[chatId];
      if(chatMessages){
        chatMessages.seenMessages[message._id] = message;
        chatMessages.seenMessagesIds.push(message._id);
      }
    },
    addToNewMessages:(state, action:PayloadAction<{chatId: string, message: IMessage}>) => {
      const {chatId, message} = action.payload;
      const chatMessages = state.messages[chatId];
      if(chatMessages){
        chatMessages.newMessages[message._id] = message;
        chatMessages.newMessagesIds.push(message._id);
      }
    },
    updateMessageStatus:(state, action:PayloadAction<IMessageStatusUpdatePayload[]>) => {
      action.payload.forEach(({messageId, roomId, status}) => {
        const message = state.messages[roomId].seenMessages[messageId];
        if(message){
          message.deliveryStatus = status;
        }
      })
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
  updateMessageStatus
} = messagesSlice.actions;
export default messagesSlice.reducer;