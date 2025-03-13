import { useGetAndSearchFriends } from '@/hooks/friendshipHooks';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import defaultImage from "../../assets/defaultAvatar.jpg";
import Loader from '../Loader';
import SearchBar from '../SearchBar';
import FriendCardSimple from './FriendCardSimple';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

interface Props {
  onFriendClick: (userId: string, name: string) => void
}
const FriendSelector: React.FC<Props> = ({
  onFriendClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedPage, setSearchedPage] = useState(1);
  const {
    friends,
    getFriends,
    searchInFriends,
    searchedFriends,
    searchedHasMore,
    mainLoading,
    moreLoading,
    clearSearchResult
  } = useGetAndSearchFriends();

  const rootElement = useRef<HTMLDivElement | null>(null);
  const {setLastElement} = useInfiniteScroll({
    root: rootElement.current,
    hasMore: searchedHasMore,
    isLoading: mainLoading || moreLoading,
    onLoadMore: async () => {
      setSearchedPage(searchedPage + 1);
      await searchInFriends(searchedPage + 1, searchQuery);
    }
  })

  const handleCardClick = useCallback((userId: string, name: string) => {
    onFriendClick(userId, name);
  }, []);

  useEffect(() => {
    if (friends.length === 0) {
      getFriends(1);
    }
  }, []);
  
  useEffect(() => {
    const timeout = setTimeout(async () => {
      setSearchedPage(1);
      if (!searchQuery.trim()) {
        clearSearchResult();
        return;
      }
      await searchInFriends(1, searchQuery);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  return (
    <div className='relative h-full w-full'>
      <SearchBar
        hasButton={false}
        value={searchQuery}
        onChange={(value) => setSearchQuery(value)}
        placeholder='Search by name'
      />
      {
        mainLoading ? (
          <Loader className='mt-36' />
        ) : (
          <div className='overflow-y-scroll absolute bottom-0 top-[50px] w-full py-1' ref={rootElement}>
            {
              searchQuery.length > 0 ? (
                searchedFriends.map((f, i) => i === searchedFriends.length - 1 ? (
                  <div key={f._id} ref={setLastElement}>
                    <FriendCardSimple
                      avatar={f.friend.profilePic?.avatar || defaultImage}
                      name={f.friend.name}
                      userId={f.friend._id}
                      onClick={handleCardClick}
                    />
                  </div>
                ) : (
                  <FriendCardSimple
                    key={f._id}
                    avatar={f.friend.profilePic?.avatar || defaultImage}
                    name={f.friend.name}
                    userId={f.friend._id}
                    onClick={handleCardClick}
                  />
                ))
              ) : (
                friends.map(f => (
                  <FriendCardSimple
                    key={f._id}
                    avatar={f.friend.profilePic?.avatar || defaultImage}
                    name={f.friend.name}
                    userId={f.friend._id}
                    onClick={handleCardClick}
                  />
                ))
              )
            }
            {
              moreLoading && (
                <Loader />
              )
            }
          </div>
        )
      }
    </div>
  )
}

export default memo(FriendSelector);
