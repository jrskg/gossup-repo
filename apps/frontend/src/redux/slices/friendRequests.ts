import type { FriendRequest, FriendRequestResponseData, FriendshipStatus } from "@/interface/interface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IFriendRequests extends FriendRequestResponseData {
  latestRequests: FriendRequest[]
}

interface UpdateFriendRequest{
  friendshipId:string,
  status:FriendshipStatus,
  isLatest:boolean
}

const initialState: IFriendRequests = {
  hasMore: false,
  totalRequests: 0,
  friendRequests: [],
  latestRequests: [],
};

export const friendRequestsSlice = createSlice({
  name:"friend_requests",
  initialState,
  reducers: {
    setFriendRequests: (state, action:PayloadAction<FriendRequestResponseData>) => {
      state.friendRequests = action.payload.friendRequests;
      state.totalRequests = action.payload.totalRequests;
      state.hasMore = action.payload.hasMore;
    },
    appendToFriendRequests: (state, action:PayloadAction<FriendRequestResponseData>) => {
      state.friendRequests = [...state.friendRequests, ...action.payload.friendRequests];
      state.hasMore = action.payload.hasMore;
    },
    updateFriendRequests:(state, action:PayloadAction<UpdateFriendRequest>) => {
      const {friendshipId, status, isLatest} = action.payload;
      if(isLatest){
        state.latestRequests = state.latestRequests.map( req => {
          if(req._id === friendshipId) req.status = status;
          return req;
        })
      }
      else{
        state.friendRequests = state.friendRequests.map( req => {
          if(req._id === friendshipId) req.status = status;
          return req;
        });
      }
    },
    removeUpdatedFriendRequest: (state, action:PayloadAction<boolean[]>) => {
      const [latestUpdated, olderUpdated] = action.payload;
      if(latestUpdated){
        console.log("latest updated");
        
        state.latestRequests = state.latestRequests.filter(req => req.status === "pending");
      }
      if(olderUpdated){
        console.log("older updated");
        state.friendRequests = state.friendRequests.filter(req => req.status === "pending");
      }
    },
    setLatestRequests: (state, action:PayloadAction<FriendRequest>) => {
      state.latestRequests = [action.payload, ...state.latestRequests];
    }
  }
});

export const {
  appendToFriendRequests,
  setFriendRequests,
  setLatestRequests,
  updateFriendRequests,
  removeUpdatedFriendRequest
} = friendRequestsSlice.actions;
export default friendRequestsSlice.reducer;
