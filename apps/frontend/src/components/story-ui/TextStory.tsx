import { TextContent } from '@/interface/storyInterface';
import React from 'react';

interface Props {
  content: TextContent
}

const TextStory: React.FC<Props> = ({ content }) => {
  const {
    backgroundColor,
    text,
    textColor,
    textFont,
  } = content;
  return (
    <div
      className="w-full h-full flex items-center justify-center p-4 rounded-md"
      style={{
        backgroundColor: backgroundColor,
        color: textColor,
        fontFamily: textFont,
        boxShadow: `0 20px 40px rgba(0,0,0,0.15)`,
      }}
    >
      <p className="text-2xl text-center transform transition-transform duration-300 hover:scale-105">
        {text}
      </p>
    </div>
  )
}

export default TextStory