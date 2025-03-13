import type { IChat } from "@/interface/chatInterface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ISelectedChat {
  selectedChat: IChat | null;
  isDetailsOn: boolean;
}

const initialState:ISelectedChat = {
  selectedChat: null,
  isDetailsOn: false
}

const selectedChatSlice = createSlice({
  name:"selectedChat",
  initialState,
  reducers: {
    setSelectedChat(state, action: PayloadAction<IChat | null>) {
      state.selectedChat = action.payload;
      if(action.payload === null){
        state.isDetailsOn = false;
      }
    },
    setIsDetailsOn(state, action: PayloadAction<boolean>) {
      state.isDetailsOn = action.payload;  
    },
    toggleAdminInSelectedChat(state, action: PayloadAction<string>) {
      if(!state.selectedChat || state.selectedChat.chatType !== "group") return; 
      const idx = state.selectedChat.admins.findIndex(a => a === action.payload);
      if(idx === -1) state.selectedChat.admins.push(action.payload);
      else state.selectedChat.admins.splice(idx, 1);
    },
    removeParticipantFromSelectedChat(state, action: PayloadAction<string>) {
      if(!state.selectedChat || state.selectedChat.chatType !== "group") return; 
      const pdx = state.selectedChat.participants.findIndex(p => p === action.payload);
      if(pdx !== -1) state.selectedChat.participants.splice(pdx, 1);
      const adx = state.selectedChat.admins.findIndex(a => a === action.payload);
      if(adx !== -1) state.selectedChat.admins.splice(adx, 1);
    }
  }
});

export const { 
  setSelectedChat, 
  setIsDetailsOn, 
  toggleAdminInSelectedChat,
  removeParticipantFromSelectedChat
} = selectedChatSlice.actions;
export default selectedChatSlice.reducer;