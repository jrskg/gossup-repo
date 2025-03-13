import { useGetAndSearchFriends } from '@/hooks/friendshipHooks'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import FriendsPageLayout from '@/layouts/FriendsPageLayout'
import React, { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FriendCard from './FriendCard'
import Loader from './Loader'
import SearchBar from './SearchBar'

const FriendsList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchedPage, setSearchedPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const { friends, getFriends, mainLoading, moreLoading, hasMore, searchedHasMore, searchInFriends, searchedFriends, clearSearchResult } = useGetAndSearchFriends();
  const navigate = useNavigate();
  const {setLastElement} = useInfiniteScroll({
    hasMore,
    isLoading: mainLoading || moreLoading,
    onLoadMore: async () => {
      setPage(prev => prev + 1);
      await getFriends(page + 1);
    }
  });

  const {setLastElement:setLastSearchedElement} = useInfiniteScroll({
    hasMore: searchedHasMore,
    isLoading: mainLoading || moreLoading,
    onLoadMore: async () => {
      setSearchedPage(prev => prev + 1);
      await searchInFriends(searchedPage + 1, searchQuery);
    }
  });

  const handleSearch = useCallback(
    async () => {
      if (searchQuery.trim()) {
        setHasSearched(true);
        await searchInFriends(1, searchQuery)
      }
    },
    [searchQuery, hasSearched],
  )
  const onRefresh = async () => {
    setPage(1);
    setSearchQuery('');
    await getFriends(1);
  }
  useEffect(() => {
    (async () => {
      if (friends.length === 0) {
        await getFriends(1);
      }
    })()
  }, []);

  useEffect(() => {
    const timeount = setTimeout(() => {
      if (!searchQuery.trim()) {
        clearSearchResult();
        setHasSearched(false);
        setSearchedPage(1);
      }
    }, 300);
    return () => clearTimeout(timeount);
  }, [searchQuery]);

  return (
    <FriendsPageLayout heading='Friends' refreshHandler={onRefresh} refreshLoading={mainLoading}>
      {
        mainLoading ?
          <div className='w-full h-[40vh] flex justify-center items-center'>
            <Loader />
          </div> : (
            <>
              <div className='w-full sm:w-[90%] md:w-[80%] lg:w-[50%]  mb-6 m-auto'>
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  disabled={mainLoading || moreLoading}
                  searchHandler={handleSearch}
                />
              </div>
              <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 sm:gap-5 justify-center content-center'>
                {(() => {
                  const dataToDisplay = searchedFriends.length > 0 ? searchedFriends : friends;
                  if (searchQuery.trim() && hasSearched && searchedFriends.length === 0) {
                    return (
                      <div className='h-[40vh] col-span-full flex justify-center items-center'>
                        <p className='text-3xl'>No friends found</p>
                      </div>
                    )
                  }
                  if (!searchQuery && friends.length === 0) {
                    return (
                      <div className='h-[40vh] col-span-full flex flex-col justify-center items-center space-y-1'>
                        <p className='text-3xl'>You don't have any friends</p>
                        <div className='text-lg'>
                          <Link className='text-blue-500 font-bold' to={"/search"}>CLICK HERE </Link>
                          <span>to find friends</span>
                        </div>
                      </div>
                    )
                  }
                  return dataToDisplay.map((item, index) => dataToDisplay.length - 1 === index ? (
                    <div key={item._id} ref={searchedFriends.length > 0 ? setLastSearchedElement : setLastElement}>
                      <FriendCard
                        name={item.friend.name}
                        navigate={navigate}
                        updatedAt={item.updatedAt}
                        userId={item.friend._id}
                        profilePic={item.friend?.profilePic}
                      />
                    </div>
                  ) : (
                    <div key={item._id}>
                      <FriendCard
                        name={item.friend.name}
                        navigate={navigate}
                        updatedAt={item.updatedAt}
                        userId={item.friend._id}
                        profilePic={item.friend?.profilePic}
                      />
                    </div>
                  ))
                })()}
              </div>
              {moreLoading && <Loader className='my-10' label='Loading more...' />}
            </>
          )
      }
    </FriendsPageLayout>
  )
}

export default FriendsList