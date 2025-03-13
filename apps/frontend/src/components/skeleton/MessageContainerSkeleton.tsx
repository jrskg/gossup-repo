const MessageContainerSkeleton = () => {
  return (
    <div className="animate-pulse w-full h-full flex flex-col gap-1 px-2 py-1">
      {Array.from({ length: 11 }).map((_, index) => (
        <div
          key={index}
          className={`flex items-start ${
            index % 2 === 0 ? "justify-start" : "justify-end"
          }`}
        >
          {index % 2 === 0 && (
            <div className="w-12 h-12 rounded-full bg-mixed-5 dark:bg-mixed-3  mr-2"></div>
          )}
          <div
            className={`${
              index % 2 === 0
                ? "bg-mixed-5 dark:bg-mixed-3  rounded-tl-none"
                : "bg-primary-2 dark:primary-3 rounded-tr-none"
            } rounded-3xl mt-3`}
            style={{
              width: `${Math.floor(Math.random() * (80-25) + 25)}%`,
              height: `${Math.floor(Math.random() * (80-30) + 30)}px`,
            }}
          ></div>
          {index % 2 !== 0 && (
            <div className="w-12 h-12 rounded-full bg-primary-2 dark:primary-3  ml-2"></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MessageContainerSkeleton;
