import type { ChatMap, IChat, IMessage, Participants, ParticipantsMap } from "@/interface/chatInterface";
import { getMapFromArray } from "@/utils/utility";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { addToNewMessages, addToSeenMessages } from "./messages";

interface IChatState {
  chatMap: ChatMap;
  orderedChatIds: string[];
  participants: ParticipantsMap;
}

interface IChatPayloadMultiple {
  chats: IChat[],
  participants: Participants
}

const initialState: IChatState = {
  chatMap: {},
  orderedChatIds: [],
  participants: {},
};

const updateChatOrder = (state: IChatState, chatId: string, message: IMessage) => {
  const chat = state.chatMap[chatId];
  if(chat){
    chat.lastMessageId = message._id;
    chat.updatedAt = message.createdAt;

    const idx = state.orderedChatIds.findIndex(_id => _id === chatId);
    if(idx !== -1) state.orderedChatIds.splice(idx, 1);
    state.orderedChatIds.unshift(chatId);
  }
}

const chatSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    setChatState(state, action: PayloadAction<IChatPayloadMultiple>) {
      const {map, orderedIds} = getMapFromArray(action.payload.chats);
      state.chatMap = map;
      state.orderedChatIds = orderedIds;
      state.participants = getMapFromArray(action.payload.participants).map;
    },
    updateChat(state, action: PayloadAction<IChat>) {
      state.chatMap[action.payload._id] = action.payload;
    },
    addToChatState(state, action: PayloadAction<IChatPayloadMultiple>) {
      const {map, orderedIds} = getMapFromArray(action.payload.chats);
      state.orderedChatIds.unshift(...orderedIds);
      Object.entries(map).forEach(([key, value]) => {
        state.chatMap[key] = value;
      })
      const newParticipants = getMapFromArray(action.payload.participants).map;
      Object.entries(newParticipants).forEach(([key, value]) => {
        state.participants[key] = value;
      });
    },
    appendToChatState(state, action: PayloadAction<IChatPayloadMultiple>) {
      const {map, orderedIds} = getMapFromArray(action.payload.chats);  
      state.orderedChatIds.push(...orderedIds);
      Object.entries(map).forEach(([key, value]) => {
        state.chatMap[key] = value;
      })
      const newParticipants = getMapFromArray(action.payload.participants).map;
      Object.entries(newParticipants).forEach(([key, value]) => {
        state.participants[key] = value;
      });
    },
    addParticipant(state, action: PayloadAction<Participants>) {
      const newParticipants = getMapFromArray(action.payload).map;
      Object.entries(newParticipants).forEach(([key, value]) => {
        state.participants[key] = value;
      })
    },
    removeChat(state, action: PayloadAction<string>) {
      delete state.chatMap[action.payload];
      const idx = state.orderedChatIds.findIndex(_id => _id === action.payload);
      if(idx !== -1) state.orderedChatIds.splice(idx, 1);
    },
    toggleAdminInChatState(state, action: PayloadAction<{chatId: string, participantId: string}>) {
      const chat = state.chatMap[action.payload.chatId];
      if(chat && chat.chatType === "group"){
        const idx = chat.admins.findIndex(a => a === action.payload.participantId);
        if(idx === -1) chat.admins.push(action.payload.participantId);
        else chat.admins.splice(idx, 1);
      }
    },
    removeParticipantFromChatState(state, action: PayloadAction<{chatId: string, participantId: string}>) {
      const chat = state.chatMap[action.payload.chatId];
      if(chat && chat.chatType === "group"){
        const pdx = chat.participants.findIndex(p => p === action.payload.participantId);
        if(pdx !== -1) chat.participants.splice(pdx, 1);
        const adx = chat.admins.findIndex(a => a === action.payload.participantId);
        if(adx !== -1) chat.admins.splice(adx, 1);
      }
    }
  },
  extraReducers:(builder) => {
    builder.addCase(addToSeenMessages, (state, action) => {
      const {chatId, message} = action.payload;
      updateChatOrder(state, chatId, message);
    })
    .addCase(addToNewMessages, (state, action) => {
      const {chatId, message} = action.payload;
      updateChatOrder(state, chatId, message);
    })
  },
});

export const { 
  setChatState, 
  addToChatState, 
  appendToChatState,
  addParticipant, 
  removeChat, 
  updateChat ,
  toggleAdminInChatState,
  removeParticipantFromChatState
} = chatSlice.actions;
export default chatSlice.reducer;

