import { IUserShort } from "./interface";

export type StoryType = 'text' | 'image' | 'video' | 'audio';
export type VisibilityType = 'all' | 'only' | 'except';
export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry' | 'care';

export enum WhoseStory{
  Friend = "friend",
  Mine = "mine"
};

export interface TextContent {
  text: string;
  textColor: string;
  textFont: string;
  backgroundColor: string;
  duration: number;
}

export interface MediaContent {
  mediaUrl: string;
  duration: number;
  caption?: string;
}

export interface BaseStory {
  _id: string;
  type: StoryType;
  content: TextContent | MediaContent;
  createdAt: string;
  updatedAt: string;

  // userId: string;
  //not needed in frontend
  // visibility: VisibilityType;
  // allowedUsers: string[];
  // excludedUsers: string[];
  // expireAt: string;
}

export interface FriendStory extends BaseStory{
  userId: never;
  user: IUserShort,
  hasViewed: boolean;
  reactions: ReactionType[]; //i am not using this but can be used to show my reactions on friends story
}

export interface StoryView{
  _id: string;
  viewedBy: IUserShort;
  reactions?: ReactionType[];
  createdAt: string;
  updatedAt: string
}

export interface MyStory extends BaseStory{
  views: StoryView[]
}

export function isTextStory<T extends BaseStory>(story: T): story is T & { content: TextContent } {
  return story.type === 'text';
}

export function isMediaStory<T extends BaseStory>(story: T): story is T & { content: MediaContent } {
  return ['image', 'video', 'audio'].includes(story.type);
}

export function isFriendStory<T extends BaseStory>(story: T): story is T & { user: IUserShort } {
  return 'user' in story;
}

export function isMyStory<T extends BaseStory>(story: T): story is T & { views: StoryView[] } {
  return 'views' in story;
}
export interface FriendStoryResponse{
  stories: FriendStory[];
  totalStoryCount: number;
  hasMore: boolean;
}