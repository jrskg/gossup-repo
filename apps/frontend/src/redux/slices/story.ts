import { FriendStory, FriendStoryResponse, MyStory, ReactionType, StoryView } from "@/interface/storyInterface";
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
    updateMyStoriesViews(state, action: PayloadAction<{storyId: string, view: StoryView}>){
      const {storyId, view} = action.payload;
      const story = state.myStories.find(s => s._id === storyId);
      if(story){
        const idx = story.views.findIndex(v => v._id === view._id);
        if(idx === -1) story.views.push(view); 
        else story.views[idx] = view;
      }
    },
    addReactionToMyStory(state, action: PayloadAction<{storyId: string, reactions: ReactionType[], userId: string}>){
      const {reactions, storyId, userId} = action.payload;
      const story = state.myStories.find(s => s._id === storyId);
      if(story){
        const storyView = story.views.find(v => v.viewedBy._id === userId);
        if(storyView){
          storyView.reactions = storyView.reactions ? storyView.reactions : [];
          storyView.reactions.push(...reactions);
          storyView.reactions.splice(0, storyView.reactions.length - 5);
        }
      }
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
    addToFriendStories(state, action: PayloadAction<FriendStory>){
      const friendId = action.payload.user._id;
      const stories = state.friendStoriesMap[friendId];
      if(!stories){
        state.orderedFriendIds.unshift(friendId);
        state.friendStoriesMap[friendId] = [action.payload];
      }else{
        stories.unshift(action.payload);
      }
    },
    deleteFromFriendStories(state, action: PayloadAction<{friendId: string, storyId: string}>){
      const {friendId, storyId} = action.payload;
      const stories = state.friendStoriesMap[friendId];
      if(stories && stories.length > 0){
        const idx = stories.findIndex(s => s._id === storyId);
        if(idx !== -1){
          stories.splice(idx, 1);
          if(stories.length === 0){
            delete state.friendStoriesMap[friendId];
            state.orderedFriendIds = state.orderedFriendIds.filter(id => id !== friendId);
          }
        }
      }
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
  deleteMyStory,
  addToFriendStories,
  updateMyStoriesViews,
  addReactionToMyStory,
  deleteFromFriendStories
} = storySlice.actions;

export default storySlice.reducer;