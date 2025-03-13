const ChatListSkeleton = () => {
  return (
    <div className="animate-pulse w-full flex flex-col p-1">
      <div className="w-full h-8 bg-primary-1 dark:bg-mixed-3 rounded-md mb-1"></div>
      <div className="flex items-center w-full gap-4 px-1 mt-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="w-[15%] h-8 bg-primary-1 dark:bg-mixed-3 rounded-lg"></div>
        ))}
      </div>
      {Array.from({ length: 9 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center w-full gap-4 p-2"
        >
          {/* Avatar Skeleton */}
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary-1 dark:bg-mixed-3"></div>

          {/* Chat details skeleton */}
          <div className="flex flex-col w-full gap-2">
            <div className="w-[90%] h-4 bg-primary-1 dark:bg-mixed-3 rounded"></div>
            <div className="w-[75%] h-4 bg-primary-1 dark:bg-mixed-3 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatListSkeleton;
