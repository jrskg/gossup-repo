export type StoryType = 'text' | 'image' | 'video' | 'audio';
export type VisibilityType = 'all' | 'only' | 'except';
export interface Story {
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
  hasViewed: boolean;
  reactions: string[][];
}

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
  caption?: string; // Optional caption for image types
}

// Helper type guards
export function isTextStory(story: Story): story is Story & { content: TextContent } {
  return story.type === 'text';
}

export function isMediaStory(story: Story): story is Story & { content: MediaContent } {
  return ['image', 'video', 'audio'].includes(story.type);
}
