import { IUserShort } from "./interface";

export type CallType = "audio" | "video";
export type CallStatus = "outgoing-ringing" | "connected" | "ended" | "incoming-ringing" | "calling";

export type IncomingCall = {
  from: IUserShort;
  offer: RTCSessionDescriptionInit;
  callType: CallType;
};

export type WebRTCContextType = {
  callUser: (user: IUserShort, callType: CallType) => void;
  answerCall: () => void;
  endCall: () => void;
  incomingCall: IncomingCall | null;
  callStatus: CallStatus | null;
  callType: CallType | undefined;
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
};

