import type { IUser } from "@/interface/interface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  isAuthenticated: boolean;
  user: IUser | null;
}

const initialState: UserState = {
  isAuthenticated: false,
  user: null,
}

export const userSlice = createSlice({
  name:"user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setJustUser: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
  },
});
export const {  setUser, setJustUser, setAuthenticated } = userSlice.actions;
export default userSlice.reducer;