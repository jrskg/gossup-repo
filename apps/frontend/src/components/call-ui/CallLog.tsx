import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { CallLogResponse } from '@/interface/callInterface';
import { ResponseWithData } from '@/interface/interface';
import { appendTabCallLogs, CallData } from '@/redux/slices/call';
import instance from '@/utils/axiosInstance';
import { AxiosError } from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import CallLogSkeleton from '../skeleton/CallLogSkeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import CallCard from './CallCard';
import Loader from '../Loader';

export const callLogTabs = ['all', 'missed', 'incoming', 'outgoing'] as const;
export type CallLogTab = typeof callLogTabs[number];

const CallLog = () => {
  const [activeTab, setActiveTab] = useState<CallLogTab>("all");
  const [loading, setLoading] = useState(false);
  const [moreLoading, setMoreloading] = useState(false);

  const dispatch = useAppDispatch();
  const {
    calls,
    users,
    allCalls,
    incomingCalls,
    missedCalls,
    outgoingCalls
  } = useAppSelector(state => state.call);
  const { user: loggedInUser } = useAppSelector(state => state.user);

  // To prevent double API call in React Strict Mode (dev only)
  // Ensures getCallLogs() runs only once, even though effect mounts twice in dev
  // const didFetchRef = useRef<boolean>(false);

  const dataTabMapping = useMemo(() => {
    const mapping: Record<CallLogTab, CallData> = {
      all: allCalls,
      missed: missedCalls,
      incoming: incomingCalls,
      outgoing: outgoingCalls,
    }
    return mapping
  }, [allCalls, missedCalls, incomingCalls, outgoingCalls]);

  const getCallLogs = useCallback(async (callLogTab: CallLogTab, cursor: string | null, isMore = false) => {
    if (!callLogTab) callLogTab = "all";
    if (!cursor) cursor = "";
    try {
      if (isMore) setMoreloading(true);
      else setLoading(true);
      const { data } = await instance.get<ResponseWithData<CallLogResponse>>(`/call/logs?tab=${callLogTab}&cursor=${cursor}`);
      dispatch(appendTabCallLogs({
        calls: data.data.calls,
        cursor: data.data.cursor,
        hasMore: data.data.hasMore,
        users: data.data.users,
        tabType: callLogTab
      }))
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      }
      console.error(error);
    } finally {
      if (isMore) setMoreloading(false);
      else setLoading(false);
    }
  }, [dispatch]);


  const { setLastElement } = useInfiniteScroll({
    // root: rootElement.current,
    hasMore: dataTabMapping[activeTab].hasMore,
    isLoading: moreLoading,
    onLoadMore: async () => {
      await getCallLogs(activeTab, dataTabMapping[activeTab].cursor, true)
    }
  })

  useEffect(() => {
    const callLogsPerTab = dataTabMapping[activeTab];
    if (callLogsPerTab && callLogsPerTab.dataIds.length === 0) {
      getCallLogs(activeTab, callLogsPerTab.cursor);
    }
  }, [dataTabMapping, activeTab, getCallLogs]);

  return (
    <div className='w-full h-full'>
      <Tabs className='w-full h-full' value={activeTab} onValueChange={tab => setActiveTab(tab as CallLogTab)}>
        <TabsList className='w-full h-10'>
          {callLogTabs.map(tab => (
            <TabsTrigger key={tab} value={tab} className='w-[25%] h-8 capitalize'>
              {tab} <span className='hidden md:inline ml-1'>Calls</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className='w-full h-full'>
          {loading ? <CallLogSkeleton /> :
            dataTabMapping[activeTab].dataIds.length === 0 ?
              <div className='w-full h-[50vh] flex justify-center items-center'>
                <h1 className='text-3xl text-gray-900 dark:text-gray-200'>No {activeTab === "all" ? "call" : activeTab + " calls"} found.</h1>
              </div> :
              dataTabMapping[activeTab].dataIds.map((callId, index) => {
                const call = calls[callId];
                const otherUser = users[loggedInUser?._id === call.callee ? call.caller : call.callee];
                return dataTabMapping[activeTab].dataIds.length - 1 === index ? <div
                  key={callId}
                  ref={setLastElement}
                >
                  <CallCard
                    callType={call.callType}
                    callee={call.callee}
                    caller={call.caller}
                    createdAt={call.createdAt}
                    duration={Math.round((new Date(call.endedAt).getTime() - new Date(call.connectedAt).getTime()) / 1000)}
                    loggedInUserId={loggedInUser?._id!}
                    otherUserName={otherUser.name}
                    otherUserAvatar={otherUser.profilePic?.avatar}
                    status={call.status}
                  />
                </div> :
                  <CallCard
                    key={callId}
                    callType={call.callType}
                    callee={call.callee}
                    caller={call.caller}
                    createdAt={call.createdAt}
                    duration={Math.round((new Date(call.endedAt).getTime() - new Date(call.connectedAt).getTime()) / 1000)}
                    loggedInUserId={loggedInUser?._id!}
                    otherUserName={otherUser.name}
                    otherUserAvatar={otherUser.profilePic?.avatar}
                    status={call.status}
                  />
              })}
              {moreLoading && <Loader />}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CallLog