import { cn } from '@/lib/utils';
import React from 'react'

interface Props{
  isPaused: boolean;
  onClick?: () => void;
}
const AudioAnimation:React.FC<Props> = ({isPaused, onClick}) => {
  return (
    <div className={cn(
      "relative w-40 h-40 flex items-center justify-center",
      onClick ? "cursor-pointer" : "",
    )}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-white/10 rounded-full backdrop-blur-xl shadow-2xl" />
      <div className={`flex gap-1.5 ${!isPaused ? 'animate-pulse' : ''}`}>
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className="w-3 h-12 bg-gradient-to-t from-cyan-400 to-blue-600 rounded-full"
            style={{
              animation: `bounce 1.2s infinite ${i * 0.1}s`,
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default AudioAnimation