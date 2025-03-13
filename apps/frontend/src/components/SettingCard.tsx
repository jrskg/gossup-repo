import React, { useState } from 'react'
import { Switch } from './ui/switch'

interface SettingCardProps {
  icon: React.ReactNode
  label: string
  hasSwitch?: boolean
  onSwitchChange?: (enabled: boolean) => Promise<void>
  currentValue?: boolean
  onClick?: () => void
  loading?: boolean
}

const SettingCard: React.FC<SettingCardProps> = ({
  icon,
  label,
  onClick = () => { },
  currentValue,
  hasSwitch,
  onSwitchChange,
  loading
}) => {
  const [checked, setChecked] = useState(currentValue);
  const handleSwitchChange = async(val:boolean) => {
    setChecked(val);
    if(onSwitchChange) {
      await onSwitchChange(val);
    }
  }
  return (
    <div onClick={!loading ? onClick : () => {}} className='flex justify-between items-center border-b py-2 border-mixed-1 dark:border-dark-6 w-[90%]'>
      <div className=''>
        <div className='flex space-x-2 justify-center items-center'>
          {icon}
          <p className='text-xl font-bold'>{label}</p>
        </div>
        <p className='pl-8'>{currentValue}</p>
      </div>
      {
        hasSwitch && <div className='px-4 py-1 inline-block rounded-sm'>
          <Switch disabled={loading} className="bg-success" checked={checked} onCheckedChange={handleSwitchChange} />
        </div>
      }
    </div>
  )
}

export default SettingCard