import { CallLogTab } from "@/components/call-ui/CallLog";
import { ICall } from "@/interface/callInterface";
import { IUserShort } from "@/interface/interface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CallData{
  dataIds: string[];
  cursor: string | null
  hasMore: boolean
}

const callDataInitialValue:CallData = {
  cursor: null,
  dataIds: [],
  hasMore: false
}
export interface CallState{
  calls: Record<string, ICall>;
  users: Record<string, IUserShort>;
  allCalls: CallData;
  missedCalls: CallData;
  incomingCalls: CallData;
  outgoingCalls: CallData;
}

type CallDataKeys = 'allCalls' | 'missedCalls' | 'incomingCalls' | 'outgoingCalls';
const tabStateMapping: Record<CallLogTab, CallDataKeys> = {
  all: "allCalls",
  missed: "missedCalls",
  incoming: "incomingCalls",
  outgoing: "outgoingCalls",
}

const initialState: CallState = {
  calls: {},
  users: {},
  allCalls: {...callDataInitialValue},
  incomingCalls: {...callDataInitialValue},
  missedCalls: {...callDataInitialValue},
  outgoingCalls: {...callDataInitialValue},
}

function addToTabData(callIds: string[], cursor: string | null, hasMore: boolean, callData: CallData){
  const existingIds = new Set(callData.dataIds);
  const newUniqueIds = callIds.filter(id => !existingIds.has(id));
  callData.dataIds.push(...newUniqueIds);
  callData.cursor = cursor;
  callData.hasMore = hasMore;
}
export const callSlice = createSlice({
  name:"calls",
  initialState,
  reducers:{
    appendTabCallLogs(state, action: PayloadAction<{calls: ICall[], hasMore: boolean, users: IUserShort[], cursor: string | null, tabType: CallLogTab}>){
      const {calls, cursor, hasMore, users, tabType} = action.payload;

      const callIds: string[] = [];
      calls.forEach(call => {
        state.calls[call._id] = call;
        callIds.push(call._id);
      });
      users.forEach(user => state.users[user._id] = user);
      const key = tabStateMapping[tabType];
      addToTabData(callIds, cursor, hasMore, state[key]);
    },
    addCall(state, action: PayloadAction<{call: ICall, users: IUserShort[], tabType: CallLogTab}>){
      const {call, users, tabType} = action.payload
      state.calls[call._id] = call
      users.forEach(user => state.users[user._id] = user);
      
      if (!state.allCalls.dataIds.includes(call._id)) state.allCalls.dataIds.unshift(call._id);
      
      const key = tabStateMapping[tabType];
      if(!key || key === "allCalls") return;

      const callData = state[key]
      if (!callData.dataIds.includes(call._id))callData.dataIds.unshift(call._id);
    },
    updateCall(state, action: PayloadAction<ICall>){
      state.calls[action.payload._id] = action.payload
    }
  }
});

export const {
  addCall,
  appendTabCallLogs,
  updateCall
} = callSlice.actions;

export default callSlice.reducer