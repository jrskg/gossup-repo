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
  userId: string;
  type: StoryType;
  content: TextContent | MediaContent;
  visibility: VisibilityType;
  allowedUsers: string[];
  excludedUsers: string[];
  expireAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface FriendStory extends BaseStory{
  hasViewed: boolean;
  reactions: ReactionType[][];
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
