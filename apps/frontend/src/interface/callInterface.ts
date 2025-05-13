import { IUserShort } from "./interface";
import { CallType } from "./webRtcInterface";

export type CallStatusDB = "initiated" | "missed" | "connected" | "rejected";

export interface ICall{
  _id: string;
  caller: string;
  callee: string;
  status: CallStatusDB;
  callType: CallType;
  // callDuration: number;
  connectedAt: string;
  endedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CallLogResponse{
  calls: ICall[];
  hasMore: boolean;
  users: IUserShort[];
  cursor: string | null;
}