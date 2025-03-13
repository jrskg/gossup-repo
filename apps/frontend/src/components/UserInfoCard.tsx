import React from 'react'

interface UserInfoCardProps {
  leftIcon: React.ReactNode
  rightIcon?: React.ReactNode
  label: string
  value: string
  description?: string
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({
  leftIcon,
  rightIcon,
  label,
  value,
  description
}) => {
  return (
    <div className='flex flex-col p-2 md:p-4 min-w-[80%] rounded-sm'>
      <div className='flex justify-between'>
        <div className='flex space-x-4'>
          {leftIcon}
          <div>
            <p className='text-md md:text-lg'>{label}</p>
            <p className='text-lg md:text-xl font-bold'>{value}</p>
            {description && <p className='text-sm pr-2 mt-1 text-wrap'>{description}</p>}
          </div>
        </div>
        {rightIcon}
      </div>
    </div>
  )
}

export default UserInfoCard