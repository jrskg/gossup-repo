const StoryPageSkeleton = () => {
  return (
    <div className="animate-pulse w-full flex flex-col p-4">
      {/* Top Left Text Placeholder */}
      <div className="w-1/4 h-6 bg-primary-1 dark:bg-mixed-3 rounded-md mb-6"></div>

      {/* My Story Section */}
      <div className="flex gap-4 mb-8">
        {/* Create Story Circle */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-28 h-28 rounded-full bg-primary-1 dark:bg-mixed-3"></div>
          <div className="w-16 h-3 bg-primary-1 dark:bg-mixed-3 rounded"></div>
        </div>

        {/* My Story Circle */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-28 h-28 rounded-full bg-primary-1 dark:bg-mixed-3"></div>
          <div className="w-16 h-3 bg-primary-1 dark:bg-mixed-3 rounded"></div>
        </div>
      </div>

      {/* Friend Stories Heading */}
      <div className="w-1/3 h-6 bg-primary-1 dark:bg-mixed-3 rounded-md mb-4"></div>

      {/* Friend Stories List */}
      <div className="flex flex-row gap-4 flex-wrap">
        {Array.from({ length: 14 }).map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-2 justify-center">
            <div className="w-28 h-28 rounded-full bg-primary-1 dark:bg-mixed-3"></div>
            <div className="w-16 h-3 bg-primary-1 dark:bg-mixed-3 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoryPageSkeleton;