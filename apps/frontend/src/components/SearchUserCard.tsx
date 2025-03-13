import React, { memo } from 'react'
import { NavigateFunction } from 'react-router-dom'

interface SearchUserCardProps { 
  name: string
  avatar: string
  _id:string
  navigate:NavigateFunction
}

const SearchUserCard: React.FC<SearchUserCardProps> = ({
  name,
  avatar,
  _id,
  navigate
}) => {  
  return (
    <div className='flex w-full items-center gap-2 p-1 rounded-sm hover:bg-dark-6 cursor-pointer dark:hover:bg-mixed-1 transition-all' onClick={() => navigate(`/user/${_id}`)}>
      <img src={avatar} alt="user" className='w-[60px] h-[60px] rounded-full' />
      <p className='text-xl font-bold'>{name}</p>
    </div>
  )
}

export default memo(SearchUserCard);