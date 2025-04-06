import { IUserShort } from '@/interface/interface';
import { ReactionType } from '@/interface/storyInterface';
import { EMOJI_MAPPING } from '@/utils/constants';
import React, { memo } from 'react';
import defaultImage from "../../assets/defaultAvatar.jpg"

interface Props {
  viewedBy: IUserShort;
  reactions?: ReactionType[];
  createdAt: string;
}

const StoryViewCard: React.FC<Props> = ({ createdAt, reactions, viewedBy }) => {
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-center justify-between py-2 px-4 bg-slate-200 dark:bg-dark-4 transition-colors rounded-lg group">
      <div className="flex items-center space-x-3 flex-1">
        <div className="relative">
          <img
            src={viewedBy.profilePic ? viewedBy.profilePic.avatar : defaultImage}
            alt={viewedBy.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-primary-1 shadow-sm"
          />
        </div>

        <div>
          <h3 className="font-medium text-lg text-dark-1 dark:text-white">{viewedBy.name}</h3>
          <p className="text-sm text-dark-1 dark:text-white opacity-70">{formattedDate}</p>
        </div>
      </div>

      {reactions && reactions.length > 0 && (
        <div className="flex items-center space-x-1">
          {reactions.map((reaction, index) => (
            <span
              key={`${reaction}-${index}`}
              className={`text-lg rounded-full font-medium`}
            >
              {EMOJI_MAPPING[reaction]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(StoryViewCard);