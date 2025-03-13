import { cn } from '@/lib/utils'
import React from 'react'

interface MyTabProps {
  tabs: string[]
  selectedTab: string
  onChange: (tab: string) => void
  containerClassName?: string
}
const MyTab: React.FC<MyTabProps> = ({
  selectedTab,
  tabs,
  onChange,
  containerClassName
}) => {
  return (
    <div className={cn("flex space-x-1", containerClassName)}>
      {
        tabs.map((tab, idx) => (
          <div
            className={
              cn(
                "bg-primary-5 dark:bg-dark-3 px-3 py-1 rounded-full capitalize cursor-pointer",
                selectedTab === tab && "bg-primary-1 dark:bg-dark-1"
              )
            }
            key={`tab-${idx}`}
            onClick={() => onChange(tab)}
          >{tab}</div>
        ))
      }
    </div>
  )
}

export default MyTab