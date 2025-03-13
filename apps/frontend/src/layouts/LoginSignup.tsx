import { toggleDarkMode } from '@/utils/utility';
import { MoonIcon, SunIcon } from 'lucide-react';
import React, { useState } from 'react';
interface ContainerProps {
  children: React.ReactNode;
  boxClassName?: string;
}
const LoginSignup:React.FC<ContainerProps> = ({
  children,
  boxClassName
}) => {
  const [darkMode, setDarkMode] = useState<boolean>(false)
  const handleDarkMode = () => {
    setDarkMode(!darkMode);
    toggleDarkMode(!darkMode);
  }
  return (
    <div className='w-screen h-screen flex justify-center items-center bg-primary-6 dark:bg-dark-1'>
      <div className="absolute top-5 right-5">
        {darkMode ? 
          <SunIcon onClick={handleDarkMode} className='text-3xl cursor-pointer' /> : 
          <MoonIcon onClick={handleDarkMode} className='text-3xl cursor-pointer' />
        }
      </div>
      <div className={`flex flex-col rounded-sm shadow-2xl bg-[#eeeeee] w-screen h-screen items-center lg:w-[30%] md:w-[60%] md:h-[90%] dark:bg-[#1f1f1f] ${boxClassName}`}>
        {children}
      </div>
    </div>
  )
}

export default LoginSignup