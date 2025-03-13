import Loader from '@/components/Loader';
import SearchBar from '@/components/SearchBar';
import SearchUserCard from '@/components/SearchUserCard';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import type { ResponseWithData, SearchedUserResponseData } from '@/interface/interface';
import MainLayout from '@/layouts/MainLayout';
import { setSearchResult } from '@/redux/slices/searchResult';
import instance from '@/utils/axiosInstance';
import { AxiosError } from 'axios';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import defaultAvatar from '../assets/defaultAvatar.jpg';

const SearchUser: React.FC = () => {
  const {users: searchedData, hasMore} = useAppSelector(state => state.searchedUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchHappened, setSearchHappened] = useState(false);

  const fetchData = async (page: number) => {
    try {
      setLoading(true);
      const { data } = await instance.post<ResponseWithData<SearchedUserResponseData>>('/user/search', {
        name: searchQuery,
        page: page,
      });
      if (data.success) {
        if(page === 1){
          dispatch(setSearchResult(data.data));
        }else{
          dispatch(setSearchResult({
            users: [...searchedData, ...data.data.users],
            total: data.data.total,
            hasMore: data.data.hasMore
          }));
        }
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const {setLastElement} = useInfiniteScroll({
    isLoading: loading,
    hasMore,
    onLoadMore: async () => {
      setPage((prev) => prev + 1);
      await fetchData(page + 1);
    }
  })

  const handleSearch = useCallback(
    async () => {
      if (searchQuery) {
        setPage(1);
        setSearchHappened(true);
        await fetchData(1);
      }
    },
    [searchQuery],
  )

  return (
    <MainLayout>
      <>
        <div className="py-2 px-2 md:pt-6 w-[100%] md:w-[70%] xl:w-[50%] m-auto flex flex-col items-center sticky z-10 top-0 bg-white dark:bg-dark-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            searchHandler={handleSearch}
            disabled={loading}
          />
        </div>
        <div className="px-4 pb-5 w-[100%] md:w-[70%] xl:w-[50%] m-auto flex flex-col items-center gap-1 mt-2">
          <h1 className="text-2xl font-bold mt-2">Search Results</h1>
          {searchedData.map((user, index) => index === searchedData.length - 1 ? (
            <div className='w-[100%]' key={user._id} ref={setLastElement}>
              <SearchUserCard
                name={user.name}
                avatar={user.profilePic ? user.profilePic?.avatar : defaultAvatar}
                _id={user._id}
                navigate={navigate}
              />
            </div>
          ) : (
            <div className='w-[100%]' key={user._id}>
              <SearchUserCard
                name={user.name}
                avatar={user.profilePic ? user.profilePic?.avatar : defaultAvatar}
                _id={user._id}
                navigate={navigate}
              />
            </div>
          ))}
          {loading && (
            <Loader />
          )}
          {searchQuery && searchedData.length === 0 && searchHappened && (
            <p className='text-dark-1 dark:text-foreground mt-16 text-3xl'>No results found</p>
          )}
        </div>
      </>
    </MainLayout>
  );
};

export default SearchUser;
