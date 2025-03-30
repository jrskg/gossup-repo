import React from 'react';

interface Props {
  isMe?: boolean;
  avatar: string;
  name: string;
  unseenStories: number;
  onView: () => void;
}

export const StoryCard: React.FC<Props> = ({
  isMe = false,
  avatar,
  name,
  unseenStories,
  onView
}) => {
  return (
    <div
      onClick={() => onView()}
      className="relative group w-min cursor-pointer transition-transform transform hover:scale-105"
    >
      {/* Story Border */}
      <div
        className={`w-32 h-32 rounded-full p-[5px] ${
          unseenStories > 0
            ? 'bg-gradient-to-tr from-purple-500 to-pink-500'
            : 'bg-gray-400 dark:bg-gray-600'
        }`}
      >
        <div className="w-full h-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800">
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Username with dark mode and hover effect */}
      <p className="mt-2 text-lg text-center text-gray-800 dark:text-gray-300 group-hover:text-pink-500">
        {isMe ? "Your Story" : name}
      </p>
    </div>
  );
};
