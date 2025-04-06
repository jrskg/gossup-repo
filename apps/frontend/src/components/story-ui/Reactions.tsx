import { ReactionType } from "@/interface/storyInterface";
import { cn } from "@/lib/utils";
import { EMOJI_MAPPING } from "@/utils/constants";

interface Props {
  reactions?: ReactionType[];
  storyId: string;
  className?: string;
}

const Reactions: React.FC<Props> = ({
  reactions = Object.keys(EMOJI_MAPPING) as ReactionType[],
  storyId,
  className
}) => {
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