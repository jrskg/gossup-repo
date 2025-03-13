import { RotateCwIcon } from 'lucide-react';
import React from 'react';

interface Props {
  heading?: string
  children: React.ReactNode
  refreshHandler?: () => Promise<void>
  refreshLoading?: boolean
}
const FriendsPageLayout: React.FC<Props> = ({
  heading = "",
  children,
  refreshHandler,
  refreshLoading
}) => {
  return (
    <div className='w-full relative'>
      <div className='w-full flex items-center relative mb-2'>
        {heading && <p className='px-2 text-xl text-center md:text-2xl md:text-left font-bold'>{heading}</p>}
        <RotateCwIcon 
          className={`w-7 h-7 absolute right-3 cursor-pointer ${refreshLoading ? "animate-spin" : ""}`} 
          onClick={refreshLoading ? () => {} : refreshHandler}
        />
      </div>
      {children}
    </div>
  )
}

export default FriendsPageLayout