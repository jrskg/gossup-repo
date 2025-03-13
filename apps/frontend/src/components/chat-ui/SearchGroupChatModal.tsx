import { useSetSelectedChat } from '@/hooks/chatHooks'
import { useAppDispatch } from '@/hooks/hooks'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import type { GroupChat, IGetSingleChatResponse } from '@/interface/chatInterface'
import { Image, ResponseWithData } from '@/interface/interface'
import { addToChatState } from '@/redux/slices/chats'
import instance from '@/utils/axiosInstance'
import { AxiosError } from 'axios'
import React, { Dispatch, memo, SetStateAction, useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import defaultAvatar from '../../assets/defaultAvatar.jpg'
import Loader from '../Loader'
import MyDialog from '../MyDialogue'
import SearchBar from '../SearchBar'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

interface SingleSearchedGroupChat {
  _id: string;
  groupName: string;
  groupIcon?: Image
}
interface SearchedGroupDateResponse {
  hasMore: boolean;
  groupChats: SingleSearchedGroupChat[]
}

interface Props {
  isOpen: boolean
  onClose: Dispatch<SetStateAction<boolean>>
  groupChats: GroupChat[]
}
const SearchGroupChatModal: React.FC<Props> = ({
  isOpen,
  groupChats,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [moreLoading, setMoreLoading] = useState(false);
  const [fetchChatLoading, setFetchChatLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [searchedGroupChats, setSearchedGroupChats] = useState<SingleSearchedGroupChat[]>([]);
  const rootElement = useRef<HTMLDivElement | null>(null);
  const [searchHappened, setSearchHappened] = useState(false);
  const dispatch = useAppDispatch();
  const fetchLoadingRef = useRef(false); 
  const handleSelectedChat = useSetSelectedChat();

  const { setLastElement } = useInfiniteScroll({
    root: rootElement.current,
    isLoading: fetchChatLoading || moreLoading,
    hasMore,
    onLoadMore: async () => {
      setPage(prevPage => prevPage + 1);
      await searchInGroupChat(page + 1, searchQuery);
    }
  })

  const searchInGroupChat = async (page: number, searchQuery: string) => {
    try {
      if (page === 1) setFetchChatLoading(true);
      else setMoreLoading(true);

      const { data } = await instance.post<ResponseWithData<SearchedGroupDateResponse>>('/chat/group/search', {
        search: searchQuery,
        page
      });
      if (data.success) {
        if (page === 1) setSearchedGroupChats(data.data.groupChats);
        else setSearchedGroupChats([...searchedGroupChats, ...data.data.groupChats]);
        setHasMore(data.data.hasMore);
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      }
    } finally {
      if (page === 1) setFetchChatLoading(false);
      else setMoreLoading(false);
    }
  }

  const onCardClick = useCallback(
    async(chatId: string) => {
      if(fetchLoadingRef.current){
        toast.warning("Wait a second...");
        return;
      }
      fetchLoadingRef.current = true;
      let ifChatExists = groupChats.find(chat => chat._id === chatId);
      if(ifChatExists){
        handleSelectedChat(ifChatExists);
      }else{
        try {
          setFetchChatLoading(true);
          const {data} = await instance.get<ResponseWithData<IGetSingleChatResponse>>(`/chat/${chatId}`);
          if(data.success){
            dispatch(addToChatState({chats: [data.data.chatData], participants: data.data.participants}));
            handleSelectedChat(data.data.chatData)
          }
        } catch (error) {
          if(error instanceof AxiosError && error.response){
            toast.error(error.response.data.message);
          }
        }finally{ setFetchChatLoading(false) }
      }
      fetchLoadingRef.current = false;
      onClose(false);
    },
    [groupChats, onClose, dispatch, setFetchChatLoading, instance],
  );

  useEffect(() => {
    const timeout = setTimeout(async () => {
      setPage(1);
      if (!searchQuery.trim()) {
        setSearchHappened(false);
        setSearchedGroupChats([]);
        return;
      }
      await searchInGroupChat(1, searchQuery);
      setSearchHappened(true);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  return (
    <MyDialog
      onDismiss={() => setSearchQuery('')}
      isOpen={isOpen}
      setIsOpen={onClose}
      header='Search Group Chat'
      dissmissable={!(fetchChatLoading || moreLoading)}
      footer={
        <div className='w-full'>
          {fetchChatLoading && <Loader />}
        </div>
      }
    >
      <div className='min-h-[300px] max-h-[75vh] h-[50vh] w-full relative'>
        <SearchBar
          hasButton={false}
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <div ref={rootElement} className='overflow-y-scroll absolute bottom-0 top-[45px] w-full py-1'>
          { (groupChats.length === 0 || (searchQuery.trim() && searchHappened && searchedGroupChats.length === 0)) && <div
            className='w-full h-[90%] flex justify-center items-center'
          >
              <p className='text-xl'>No Group Chats</p>
            </div>}
          {
            searchQuery.trim() ? searchedGroupChats.map((gc, i) =>
              i === searchedGroupChats.length - 1 ? (
                <div key={gc._id} ref={setLastElement}>
                  <SearchedGroupChatCard
                    key={gc._id}
                    _id={gc._id}
                    groupName={gc.groupName}
                    groupIcon={gc.groupIcon}
                    onCardClick={onCardClick}
                  />
                </div>
              ) : (
                <SearchedGroupChatCard
                  key={gc._id}
                  _id={gc._id}
                  groupName={gc.groupName}
                  groupIcon={gc.groupIcon}
                  onCardClick={onCardClick}
                />
              )
            )
              : groupChats.map(gc => (
                <SearchedGroupChatCard
                  key={gc._id}
                  _id={gc._id}
                  groupName={gc.groupName}
                  groupIcon={gc.groupIcon}
                  onCardClick={onCardClick}
                />
              ))
          }
          {
            moreLoading && (
              <Loader />
            )
          }
        </div>
      </div>
    </MyDialog>
  )
}

export default SearchGroupChatModal;

interface SearchedGroupChatCardProps {
  _id: string;
  groupName: string;
  groupIcon?: Image;
  onCardClick: (chatId: string) => void
}
const SearchedGroupChatCard: React.FC<SearchedGroupChatCardProps> = memo(({
  _id,
  groupName,
  groupIcon,
  onCardClick
}) => {
  return (
    <div
      onClick={() => onCardClick(_id)}
      className='flex items-center gap-1 px-2 py-1 mt-1 hover:bg-primary-1 dark:hover:bg-mixed-2 cursor-pointer rounded-sm'>
      <Avatar className='w-12 h-12'>
        <AvatarImage className='object-cover' src={groupIcon ? groupIcon.avatar : defaultAvatar} alt='group' />
        <AvatarFallback>G</AvatarFallback>
      </Avatar>
      <p className='font-bold'>{groupName}</p>
    </div>
  )
})