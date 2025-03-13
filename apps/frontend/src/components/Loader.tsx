import React, { useEffect, useState } from 'react'

interface LoaderProps {
  label?: string,
  className?: string
}

const Loader: React.FC<LoaderProps> = ({label, className}) => {
  const [value, setValue] = useState<number>(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setValue(prev => (prev+1)%5)
    }, 100);

    return () => clearInterval(interval);
  }, []);
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="flex space-x-2">
        {
          [...Array.from({length: 5})].map((_, index) => (
            <div key={index} className={`w-2 h-2 rounded-full ${value === index ? 'bg-blue-700 animate-ping' : 'bg-dark-6'}`}/>
          ))
        }
      </div>
      {label && <p className="text-dark-1 dark:text-foreground text-sm md:text-xl mt-1">{label}</p>}
    </div>
  )
}

export default Loader