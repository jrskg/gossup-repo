import type { FriendRequestSent, FriendshipStatusExtended } from "@/interface/interface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IRequestSent{
  requestsSent: FriendRequestSent[]
}
interface UpdateRequestsSent{
  friendshipId: string;
  status: FriendshipStatusExtended;
}

const initialState: IRequestSent = {
  requestsSent: [],
};

export const requestsSentSlice = createSlice({
  name:"friend_requests_sent",
  initialState,
  reducers: {
    setRequestsSent: (state, action:PayloadAction<FriendRequestSent[]>) => {
      state.requestsSent = action.payload;
    },
    updateRequestsSentStatus:(state, action:PayloadAction<UpdateRequestsSent>) => {
      const {friendshipId, status} = action.payload;
      state.requestsSent = state.requestsSent.map( req => {
        if(req._id === friendshipId) req.status = status;
        return req;
      });
    },
    updateOnReqSend:(state, action:PayloadAction<UpdateRequestsSent & {newFriendshipId: string}>) => {
      const {friendshipId, newFriendshipId} = action.payload;
      state.requestsSent = state.requestsSent.map( req => {
        if(req._id === friendshipId){
          req.status = "pending";
          req._id = newFriendshipId;
        }
        return req;
      });
    },
    removeUpdatedRequestsSent: (state, action:PayloadAction<boolean>) => {
      if(action.payload){
        state.requestsSent = state.requestsSent.filter(req => req.status === "pending");
      }
    }
  }
});

export const {
  setRequestsSent,
  removeUpdatedRequestsSent,
  updateRequestsSentStatus,
  updateOnReqSend
} = requestsSentSlice.actions;
export default requestsSentSlice.reducer;
