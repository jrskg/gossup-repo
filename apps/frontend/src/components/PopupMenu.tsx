import { cn } from '@/lib/utils';
import { XIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface PopupMenuProps {
  TriggerElement: React.ReactNode;
  CloseElement?: React.ReactNode;
  children: React.ReactNode;
  width?: number;
  height?: number;
  isUploading?: boolean;
  // visible: boolean;
  // setVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const PopupMenu: React.FC<PopupMenuProps> = ({
  TriggerElement,
  CloseElement = <XIcon className='md:w-8 md:h-8 w-6 h-6 cursor-pointer' />,
  children,
  width = 300,
  height = 400,
  isUploading = false
}) => {
  const [visible, setVisible] = useState(false);
  const [showChildren, setShowChildren] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if(menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setVisible(false);
        setShowChildren(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [])
  
  const handleVisibility = () => {
    if(isUploading){
      toast.info("Please wait until the current upload is completed.");
      return;
    }
    setVisible(prev => {
      if(prev) setShowChildren(false);
      return !prev;
    })
  }
  const handleTransitionEnd = () => {
    if(visible) setShowChildren(true);  
  }
  return (
    <div className='relative z-50'>
      <div
        onClick={handleVisibility}
      >{visible ? CloseElement : TriggerElement}</div>
      <div
        ref={menuRef}
        className={cn('absolute w-0 h-0 top-0 transition-all duration-300 ease-in-out bg-[#eeeeee] dark:bg-dark-3 shadow-lg shadow-dark-6 dark:shadow-dark-1 rounded-lg')}
        style={{
          width: visible ? `${width}px` : "0px",
          height: visible ? `${height}px` : "0px",
          top: visible ? `-${height + 40}px` : "0px"
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {showChildren && <div className={cn("w-ful h-full")}>
          {children}
        </div>}
      </div>
    </div>
  )
}

export default PopupMenu