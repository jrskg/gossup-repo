import { StoryPrivacy } from "@/interface/storyInterface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PrivacyState{
  storyPrivacy: StoryPrivacy;
  isLoaded: boolean
}

const initialState: PrivacyState = {
  storyPrivacy: {
    visibility: "all",
    allowedUsers: [],
    excludedUsers: []
  },
  isLoaded: false
}

const privacySlice = createSlice({
  name: 'privacy',
  initialState,
  reducers: {
    setStoryPrivacy: (state, action: PayloadAction<StoryPrivacy>) => {
      state.storyPrivacy = action.payload;
      state.isLoaded = true;
    },
    setIsPrivacyLoaded: (state, action: PayloadAction<boolean>) => {
      state.isLoaded = action.payload;
    }
  }
})

export const { setStoryPrivacy, setIsPrivacyLoaded } = privacySlice.actions;
export default privacySlice.reducer;