import { useAppDispatch } from "@/hooks/hooks";
import { ReactionType } from "@/interface/storyInterface";
import { cn } from "@/lib/utils";
import { updateStoryViewAndReaction } from "@/redux/slices/story";
import instance from "@/utils/axiosInstance";
import { EMOJI_MAPPING } from "@/utils/constants";
import { AxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Props {
  reactions?: ReactionType[];
  storyId: string;
  className?: string;
  friendId: string
}

const Reactions: React.FC<Props> = ({
  reactions = Object.keys(EMOJI_MAPPING) as ReactionType[],
  storyId,
  className,
  friendId
}) => {
  const [userReactions, setUserReactions] = useState<ReactionType[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dispatch = useAppDispatch();

  const handleReact = (reaction: ReactionType) => {
    const updatedUserReactions = [...userReactions, reaction].slice(-5);
    setUserReactions(updatedUserReactions);
    if(timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async() => {
      try {
        await instance.post(`/story/${storyId}`, {reactions: updatedUserReactions});
        dispatch(updateStoryViewAndReaction({
          friendId,
          storyId,
          reactions: updatedUserReactions
        }));
      } catch (error) {
        if(error instanceof AxiosError && error.response){
          toast.error(error.response.data.message);
          console.log(error);
        }
      }
    }, 2000);
  }

  useEffect(() => {
    return () => {
      setUserReactions([]);
    }
  }, [storyId]);

  if (!reactions?.length) return null;
  return (
    <div className={cn(
      "absolute -bottom-10 right-4 flex gap-2",
      className
    )}>
      {reactions.map((reaction, i) => (
        <span
          key={`${storyId}-${reaction}-${i}`}
          className={cn(
            "px-2.5 py-1.5 backdrop-blur-lg rounded-full text-2xl",
            "shadow-lg bg-white/20 border border-white/10",
            "transition-all duration-200 hover:scale-110 hover:bg-white/30",
            "animate-in slide-in-from-right-8 fade-in",
            "cursor-pointer active:scale-95 select-none"
          )}
          style={{
            animationDelay: `${i * 50}ms`,
            animationFillMode: "both"
          }}
          onClick={() => handleReact(reaction)}
        >
          <span className="block transition-transform duration-300 hover:scale-125">
            {EMOJI_MAPPING[reaction]}
          </span>
        </span>
      ))}
    </div>
  );
};

export default Reactions;