import React from 'react'

interface ContainerProps {
  children: React.ReactNode;
}

const MainLayout:React.FC<ContainerProps> = ({children}) => {
  return (
    <div className='md:ml-[115px] md:mb-0 mb-[90px]'>
      {children}
    </div>
  )
}

export default MainLayout