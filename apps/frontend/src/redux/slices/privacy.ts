import { StoryPrivacy } from "@/interface/storyInterface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PrivacyState{
  storyPrivacy: StoryPrivacy
}

const initialState: PrivacyState = {
  storyPrivacy: {
    visibility: "all",
    allowedUsers: [],
    excludedUsers: []
  }
}

const privacySlice = createSlice({
  name: 'privacy',
  initialState,
  reducers: {
    setStoryPrivacy: (state, action: PayloadAction<StoryPrivacy>) => {
      state.storyPrivacy = action.payload;
    },
  }
})

export const { setStoryPrivacy } = privacySlice.actions;
export default privacySlice.reducer;