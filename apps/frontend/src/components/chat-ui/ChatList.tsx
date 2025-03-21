import { ChatsContext, LoggedInUserContext, MessagesContext, ParticipantsContext, SelectedChatContext } from '@/context/contexts';
import { useGetAllChats, useGetParticipantsInfo, useSetSelectedChat } from '@/hooks/chatHooks';
import { IChat } from '@/interface/chatInterface';
import { cn } from '@/lib/utils';
import { getLastMessageText, getMessageTimestamp } from '@/utils/utility';
import { EllipsisVerticalIcon, PlusIcon } from 'lucide-react';
import React, { memo, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import MyTab from '../MyTab';
import SearchBar from '../SearchBar';
import ChatListSkeleton from '../skeleton/ChatListSkeleton';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import ChatCard from './ChatCard';
import CreateGroupChatModal from './CreateGroupChatModal';
import NewChatModal from './NewChatModal';
import SearchGroupChatModal from './SearchGroupChatModal';

interface ChatListProps {
  className?: string
}
const ChatList: React.FC<ChatListProps> = ({
  className
}) => {
  console.log("CHAT LIST rendering..." + Math.random());
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const [createGroupModal, setCreateGroupModal] = useState(false);
  const [searchGroupChatOpen, setSearchGroupChatOpen] = useState(false);

  const { _id: userId, name } = useContext(LoggedInUserContext)!;
  const { chatMap, orderedChatIds } = useContext(ChatsContext)!;
  const messages = useContext(MessagesContext)!;
  const groupChats = useMemo(() => {
    console.log("Calculating groupChats..." + Math.random());
    return Object.values(chatMap).filter(c => c.chatType === "group");
  }, [orderedChatIds.length]);

  const participants = useContext(ParticipantsContext)!;
  const selectedChat = useContext(SelectedChatContext);
  const [selectedTab, setSelectedTab] = useState("all");
  const { getChatAvatar, getChatName } = useGetParticipantsInfo(participants, userId);
  const handleSelectedChat = useSetSelectedChat();

  const handleChatClick = useCallback((sc: IChat) => {
    handleSelectedChat(sc);
  }, []);

  const {
    loading
  } = useGetAllChats(orderedChatIds, userId);

  const handleSearchBarFocus = () => {
    if (selectedTab === "group") setSearchGroupChatOpen(true);
    else if (selectedTab === "all") setNewChatModalOpen(true);
  }

  const openCreateGroupModal = () => { setCreateGroupModal(true); setDropDownOpen(false) }
  const openNewChatModal = () => { setNewChatModalOpen(true); setDropDownOpen(false) }

  return (
    <div className={cn('bg-primary-6 dark:bg-dark-2 w-full h-full md:rounded-tl-md md:rounded-bl-sm relative', className)}>
      <NewChatModal
        isOpen={newChatModalOpen}
        onClose={setNewChatModalOpen}
      />
      <CreateGroupChatModal
        isOpen={createGroupModal}
        onClose={setCreateGroupModal}
      />
      <SearchGroupChatModal
        isOpen={searchGroupChatOpen}
        onClose={setSearchGroupChatOpen}
        groupChats={groupChats}
      />
      <div className='flex items-center justify-between px-5 py-2 h-[50px]'>
        <p className='text-xl font-bold'>{name}</p>
        <DropdownMenu open={dropDownOpen} onOpenChange={(ok) => setDropDownOpen(ok)}>
          <DropdownMenuTrigger>
            <EllipsisVerticalIcon className='w-6 h-6 cursor-pointer' />
          </DropdownMenuTrigger>
          <DropdownMenuContent className='bg-primary-3 dark:bg-dark-1 border-none'>
            <DropdownMenuItem
              onClick={openNewChatModal}
              className='cursor-pointer'
            >New Chat</DropdownMenuItem>
            <DropdownMenuItem
              onClick={openCreateGroupModal}
              className='cursor-pointer'
            >Create Group</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {
        !loading && <>
          <div>
            <SearchBar
              hasButton={false}
              className='p-1'
              onFocus={handleSearchBarFocus}
              inputClassName='rounded-sm bg-primary-5 dark:bg-dark-3 focus-visible:ring-0'
              placeholder={selectedTab === "all" ? "Search in friends" : "Search in group"}
            />
          </div>
          <MyTab
            containerClassName='p-1'
            selectedTab={selectedTab}
            onChange={(tab) => setSelectedTab(tab)}
            tabs={["all", "group"]}
          />
        </>
      }
      <div className={cn('absolute top-[132px] bottom-0 w-full overflow-auto py-2 px-1', loading && "top-[40px]")}>
        {
          loading ? (<ChatListSkeleton />) : (
            (() => {
              switch (selectedTab) {
                case "all":
                  if (orderedChatIds.length === 0) {
                    return <InfoWrapper className='gap-2'>
                      <p className='text-2xl'>No Chats Available</p>
                      <Button
                        onClick={openNewChatModal}
                        className='bg-primary-3 dark:bg-dark-3 hover:bg-primary-2 dark:hover:bg-dark-4'
                      > <PlusIcon />Start a Chat</Button>
                    </InfoWrapper>
                  }
                  return orderedChatIds.map((chid) => {
                    const ch = chatMap[chid];
                    return <ChatCard
                      key={ch._id}
                      avatar={getChatAvatar(ch)}
                      chatName={getChatName(ch)}
                      lastMessage={getLastMessageText(ch.lastMessage)}
                      lastMessageTime={ch.lastMessage && getMessageTimestamp(new Date(ch.updatedAt)).time}
                      chat={ch}
                      onChatClick={handleChatClick}
                      isChatSelected={ch._id === selectedChat?._id}
                      newMessageCount={messages[ch._id].newMessagesIds.length}
                    />
                  })
                case "group":
                  if (groupChats.length === 0) {
                    return <InfoWrapper className='gap-2'>
                      <p className='text-2xl'>No Group Chats Available</p>
                      <Button
                        onClick={openCreateGroupModal}
                        className='bg-primary-3 dark:bg-dark-3 hover:bg-primary-2 dark:hover:bg-dark-4'
                      > <PlusIcon />Create Group Chat</Button>
                    </InfoWrapper>
                  }
                  return groupChats.map(ch => <ChatCard
                    key={ch._id}
                    avatar={getChatAvatar(ch)}
                    chatName={getChatName(ch)}
                    lastMessage={getLastMessageText(ch.lastMessage)}
                    lastMessageTime={ch.lastMessage && getMessageTimestamp(new Date(ch.updatedAt)).time}
                    chat={ch}
                    onChatClick={handleChatClick}
                    isChatSelected={ch._id === selectedChat?._id}
                    newMessageCount={messages[ch._id].newMessagesIds.length}
                  />)
                default:
                  return <InfoWrapper>
                    <p className='text-2xl'>Something Went Wrong!</p>
                    <p className='text-gray-800 dark:text-gray-400'>Try refreshing the page</p>
                  </InfoWrapper>
              }
            })()
          )
        }
      </div>
    </div>
  )
}

export default memo(ChatList);


interface InfoWrapperProps {
  children: ReactNode;
  className?: string;
}
const InfoWrapper: React.FC<InfoWrapperProps> = ({ children, className }) => {
  return <div className={cn('w-full h-[80%] flex flex-col justify-center items-center', className)}>
    {children}
  </div>
}