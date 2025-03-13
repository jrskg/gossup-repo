import type { Friend } from "@/interface/interface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IFriends {
  friends: Friend[]
  searchedFriends: Friend[]
}

const initialState: IFriends = {
  friends: [],
  searchedFriends: []
}

const friendSlice = createSlice({
  name: "friends",
  initialState,
  reducers: {
    setFriends: (state, action: PayloadAction<Friend[]>) => {
      state.friends = action.payload;
    },
    setSearchedFriends: (state, action: PayloadAction<Friend[]>) => {
      state.searchedFriends = action.payload;
    },
    appendToFriends: (state, action: PayloadAction<Friend[]>) => {
      state.friends = [...state.friends, ...action.payload];
    },
    appendToSearchedFriends: (state, action: PayloadAction<Friend[]>) => {
      state.searchedFriends = [...state.searchedFriends, ...action.payload];
    },
    clearSearchedFriends: (state) => {
      const combined: Friend[] = [];
      const seen = new Set<string>();
      state.friends.forEach(friend => {
        if (!seen.has(friend._id)) {
          seen.add(friend._id);
          combined.push(friend);
        }
      });
      state.searchedFriends.forEach(friend => {
        if (!seen.has(friend._id)) {
          seen.add(friend._id);
          combined.push(friend);
        }
      });
      state.friends = combined;
      state.searchedFriends = [];
    }
  }
});

export const {
  setFriends,
  appendToFriends,
  appendToSearchedFriends,
  clearSearchedFriends,
  setSearchedFriends
} = friendSlice.actions;
export default friendSlice.reducer;