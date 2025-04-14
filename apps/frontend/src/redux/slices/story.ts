import { FriendStory, FriendStoryResponse, MyStory, ReactionType } from "@/interface/storyInterface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IStoryState{
  myStories: MyStory[];
  friendStoriesMap: Record<string, FriendStory[]>;
  orderedFriendIds: string[]; //storing friend ids in order for fetching stories from friendStoriesMap
  status: StoryStateStatus;
  totalFriendStoryCount: number;
  hasMore: boolean;
}

export type StoryStateStatus = "notcalled" | "called";
const initialState: IStoryState = {
  friendStoriesMap: {},
  myStories: [],
  orderedFriendIds: [],
  status: "notcalled",
  hasMore: false,
  totalFriendStoryCount: 0,
}

const storySlice = createSlice({
  name:"story",
  initialState,
  reducers: {
    setMyStories(state, action: PayloadAction<MyStory[]>){
      state.myStories = action.payload;
    },
    appendToMyStories(state, action: PayloadAction<MyStory>){
      state.myStories.unshift(action.payload);
    },
    deleteMyStory(state, action: PayloadAction<string>){
      state.myStories = state.myStories.filter(story => story._id !== action.payload);
    },
    setStoryStateStatus(state, action: PayloadAction<StoryStateStatus>){
      state.status = action.payload;
    },
    setFriendStories(state, action: PayloadAction<FriendStoryResponse>){
      const {hasMore, stories, totalStoryCount} = action.payload;
      state.totalFriendStoryCount = totalStoryCount;
      state.hasMore = hasMore;
      const map: Record<string, FriendStory[]> = {};
      const orderedIds: string[] = [];
      stories.forEach(story => {
        if(!map[story.user._id]) {
          orderedIds.push(story.user._id);
          map[story.user._id] = [];
        }
        map[story.user._id].push(story);
      });
      state.friendStoriesMap = map;
      state.orderedFriendIds = orderedIds;
    },
    updateStoryViewAndReaction(state, action: PayloadAction<{friendId: string, storyId: string, reactions?: ReactionType[]}>){
      const {friendId, reactions, storyId} = action.payload;
      const stories = state.friendStoriesMap[friendId];
      if(stories){
        const story = stories.find(s => s._id === storyId);
        if(story){
          story.hasViewed = true;
          if(reactions){
            story.reactions.push(...reactions);
            story.reactions.splice(0, story.reactions.length - 5);
          }
        }
      }
    }
  }
});

export const  {
  setMyStories,
  appendToMyStories,
  setStoryStateStatus,
  setFriendStories,
  updateStoryViewAndReaction,
  deleteMyStory
} = storySlice.actions;

export default storySlice.reducer;