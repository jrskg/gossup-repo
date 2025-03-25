import type { DeliveryStatus } from '@/interface/chatInterface'
import { CheckCheckIcon, CheckIcon } from 'lucide-react'
import React from 'react'

interface Props {
  deliveryStatus: DeliveryStatus
}
const MessageTick: React.FC<Props> = ({ deliveryStatus }) => {
  return (
      (() => {
      switch (deliveryStatus) {
        case "sent":
          return <CheckIcon className='w-5 h-5 text-[#2b2b2b] dark:text-[#d1d1d1]' />
        case "delivered":
          return <CheckCheckIcon className='w-5 h-5 text-[#2b2b2b] dark:text-[#d1d1d1]' />
        case "seen":
          return <CheckCheckIcon className='w-5 h-5 text-[#ffea31] dark:text-[#18beff]' />
        default:
          return null;
      }
    })()
  )
}

export default MessageTick
