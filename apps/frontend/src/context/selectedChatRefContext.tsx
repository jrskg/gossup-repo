import { IChat } from '@/interface/chatInterface';
import React, { createContext, useContext, useRef } from 'react';

type SelectedChatRefType = React.MutableRefObject<IChat | null>

const SelectedChatRefContext = createContext<SelectedChatRefType | null>(null);

export const SelectedChatRefProvider:React.FC<{children:React.ReactNode}> = ({children}) => {
  const selectedChatRef = useRef<IChat | null>(null);
  return(
    <SelectedChatRefContext.Provider value={selectedChatRef}>
      {children}
    </SelectedChatRefContext.Provider>
  )
}

export const useSelectedChatRef = ():SelectedChatRefType => {
  const context = useContext(SelectedChatRefContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context
};
