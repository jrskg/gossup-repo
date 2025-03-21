import React from 'react';
import { Loader2, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress.tsx";

const InitialMessageLoadingPage = () => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          return 0;
        }
        return prevProgress + 10;
      });
    }, 800);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-purple-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="w-full max-w-md p-8 space-y-8">
        {/* Logo Container */}
        <div className="relative">
          <div className="flex items-center justify-center w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl shadow-xl">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <Sparkles className="absolute -right-2 -top-2 w-6 h-6 text-yellow-400 animate-pulse" />
        </div>

        {/* Loading Text */}
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent dark:from-purple-400 dark:to-blue-300">
            GOSS-UP
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Getting everything ready for you
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <Progress
            value={progress}
            className="h-2 bg-gray-100 dark:bg-gray-800"
          />
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-pulse w-2 h-2 rounded-full bg-purple-500"></div>
            <div className="animate-pulse w-2 h-2 rounded-full bg-blue-500 delay-100"></div>
            <div className="animate-pulse w-2 h-2 rounded-full bg-purple-500 delay-200"></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Loading awesome content...
          </p>
        </div>
      </div>
    </div>
  );
};

export default InitialMessageLoadingPage;
