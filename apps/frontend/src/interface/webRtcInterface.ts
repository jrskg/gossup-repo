import { TypedSocket } from "@/context/socketContext";
import { IUserShort } from "./interface";

export type CallType = "audio" | "video";
export type CallStatus = "idle" | "connected" | "incoming-ringing" | "calling" | "rejected" | "ended" | "busy" | "missed";

export type IncomingCall = {
  from: IUserShort;
  offer: RTCSessionDescriptionInit;
  callType: CallType;
};

export type WebRTCContextType = {
  callUser: (user: IUserShort, callType: CallType) => void;
  answerCall: () => void;
  endCall: (isLocalEnd?: boolean, beforeConnected?: boolean) => void;
  incomingCall: IncomingCall | null;
  callStatus: CallStatus;
  callType: CallType | undefined;
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
  targetUser: IUserShort | null;
  isRinging: boolean;
  onRejectCall: (isLocalReject?: boolean) => void;
  resetCalledUserState: () => void
  missedCall: (isLocalMissed?: boolean) => void
  // setCallStatus: React.Dispatch<React.SetStateAction<CallStatus>>
  toggleMedia: (media: "audio" | "video", value: boolean) => void
  remoteMediaStatus: {
    video: boolean
    audio: boolean
  }
  socket: TypedSocket | null
};

