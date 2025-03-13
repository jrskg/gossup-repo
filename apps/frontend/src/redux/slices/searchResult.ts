import type { SearchedUserResponseData } from "@/interface/interface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState:SearchedUserResponseData = {
  hasMore: false,
  total: 0,
  users: [],
}

export const searchResultSlice = createSlice({
  name:"searchResult",
  initialState,
  reducers: {
    setSearchResult: (state, action:PayloadAction<SearchedUserResponseData>) => {
      state.users = action.payload.users;
      state.total = action.payload.total;
      state.hasMore = action.payload.hasMore;
    },
    setHasMore: (state, action:PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    }
  },
});

export const {setSearchResult, setHasMore} = searchResultSlice.actions;
export default searchResultSlice.reducer;