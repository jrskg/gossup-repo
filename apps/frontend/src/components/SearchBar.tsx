import React, { memo } from 'react'
import { Input } from './ui/input'
import { SearchIcon } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  value?: string
  onChange?: (value: string) => void
  searchHandler?: () => void
  disabled?: boolean
  hasButton?: boolean
  inputClassName?: string
  className?: string
  placeholder?: string
  onFocus?: () => void
}

const SearchBar: React.FC<SearchBarProps> = ({
  disabled = false,
  onChange = () => { },
  onFocus = () => { },
  searchHandler = () => { },
  value = '',
  hasButton = true,
  className,
  inputClassName,
  placeholder="Search by name"
}) => {
  return (
    <div className={cn("flex w-full sm:space-x-2 space-y-2 sm:space-y-0 flex-col items-center sm:flex-row", className)}>
      <div className='relative w-full'>
        <SearchIcon className='absolute top-1/2 -translate-y-1/2 left-2' />
        <Input
          className={cn('rounded-full pl-10', inputClassName)}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={() => onFocus()}
        />
      </div>
      {
        hasButton && <Button variant={'outline'} className='w-[100%] sm:w-[unset]' disabled={disabled} onClick={searchHandler}>
          <SearchIcon className='mr-2 h-4 w-4 sm:h-5 sm:w-5' />
          <span className='sm:text-lg'>Search</span>
        </Button>
      }
    </div>
  )
}

export default memo(SearchBar);