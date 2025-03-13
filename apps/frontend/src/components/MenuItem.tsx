import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import React from 'react'
interface MenuItemProps {
  label: string;
  onClick: () => void;
  Icon: LucideIcon;
  iconStyle?: string;
  labelStyle?: string;
  containerSyle?: string;
}
const MenuItem: React.FC<MenuItemProps> = ({
  Icon,
  label,
  onClick,
  iconStyle,
  labelStyle,
  containerSyle
}) => {
  return (
    <div 
      onClick={onClick}
      className={cn('flex items-center gap-2 hover:bg-primary-4 dark:hover:bg-dark-4 py-1 px-2 rounded cursor-pointer transition-all duration-200', containerSyle)}>
      <Icon className={cn('w-5 h-5 cursor-pointer font-bold', iconStyle)} />
      <p className={cn('text-lg', labelStyle)}>{label}</p>
    </div>
  )
}

export default MenuItem