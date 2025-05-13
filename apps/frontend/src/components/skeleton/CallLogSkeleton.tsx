const CallLogSkeleton = () => {
  return (
    <div className="animate-pulse w-full flex flex-col p-4">
      {/* Call Log List */}
      <div className="flex flex-col gap-6">
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-primary-1 dark:bg-mixed-3"></div>

            {/* Text Info */}
            <div className="flex flex-col flex-grow gap-2">
              <div className="w-1/2 h-4 bg-primary-1 dark:bg-mixed-3 rounded"></div> {/* Caller Name */}
              <div className="w-1/3 h-3 bg-primary-1 dark:bg-mixed-3 rounded"></div> {/* Call Type / Date */}
            </div>

            {/* Call Icon Placeholder */}
            <div className="w-8 h-8 rounded-full bg-primary-1 dark:bg-mixed-3"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CallLogSkeleton;
