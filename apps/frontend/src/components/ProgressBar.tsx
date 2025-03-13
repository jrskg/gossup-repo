import React from "react";

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="relative w-full h-4 bg-gray-300 rounded-full overflow-hidden">
        <div className="absolute inset-0 bg-gray-500 opacity-30"></div>

        <div
          className="absolute inset-0 bg-success transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-black">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;