import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { IUserShort, ResponseWithData } from "@/interface/interface";
import { CallStatus, CallType, IncomingCall, WebRTCContextType } from "@/interface/webRtcInterface";
import { closePeerConnection, createPeerConnection, getLocalStream, getPeer } from "@/services/webRtc";
import { SOCKET_EVENTS } from "@/utils/constants";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useSocket } from "./socketContext";
import { CallStatusDB, ICall } from "@/interface/callInterface";
import instance from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import { addCall, updateCall } from "@/redux/slices/call";

export const WebRTCContext = createContext<WebRTCContextType | null>(null);

interface Case1 {
  call: ICall,
  isUpdate: true
}

interface Case2 {
  call: ICall,
  isUpdate: false,
  otherUser: IUserShort
}

type CallLog = Case1 | Case2

export const WebRTCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isRinging, setIsRinging] = useState(false);
  const [callType, setCallType] = useState<CallType>();

  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [targetUserState, setTargetUserState] = useState<IUserShort | null>(null);

  const [remoteMediaStatus, setRemoteMediaStatus] = useState({
    video: true,
    audio: true
  });

  const callLogRef = useRef<ICall | null>(null);
  const targetUser = useRef<IUserShort | null>(null);

  const { socket } = useSocket();
  const { user: loggedInUser } = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();

  const toggleMedia = useCallback(
    (media: "audio" | "video", value: boolean) => {
      if (localStream) {
        if (media === "audio") {
          if (localStream.getAudioTracks()[0]) localStream.getAudioTracks()[0].enabled = value;
        } else {
          if (localStream.getVideoTracks()[0]) localStream.getVideoTracks()[0].enabled = value;
        }
      }
    },
    [localStream],
  )

  const addOrUpdateCallLog = useCallback((logParam: CallLog) => {
    callLogRef.current = logParam.call
    if (logParam.isUpdate) {
      dispatch(updateCall(logParam.call))
    } else {
      dispatch(addCall({
        call: logParam.call,
        tabType: "all",
        users: [logParam.otherUser, {
          _id: loggedInUser?._id!,
          name: loggedInUser?.name!,
          profilePic: loggedInUser?.profilePic
        }]
      }))
    }
  }, [dispatch, loggedInUser]);

  const setupMedia = async (callType: CallType): Promise<MediaStream | null> => {
    try {
      const stream = await getLocalStream(callType);
      setLocalStream(stream);
      return stream;
    }
    catch (error: any) {
      toast.error(error?.message || "Error accessing media devices");
      console.error("Error accessing media devices", error);
      return null;
    }
  }
  const callUser = async (user: IUserShort, callType: CallType) => {
    setCallStatus("calling");
    targetUser.current = user;
    setTargetUserState(user);
    setCallType(callType);

    const lclStream = await setupMedia(callType);
    if (!lclStream) {
      resetCalledUserState();
      return
    }

    const call = await createCallOnDB(loggedInUser?._id!, user._id, callType);
    if (!call) {
      resetCalledUserState();
      return
    }
    addOrUpdateCallLog({ isUpdate: false, call, otherUser: user });

    const peer = createPeerConnection(handleTrack, handleIceCandidate);
    peer.getSenders().forEach(sender => peer.removeTrack(sender));
    lclStream.getTracks().forEach(track => {
      peer.addTrack(track, lclStream);
    });

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket?.emit(SOCKET_EVENTS.CALL_MADE, {
      offer,
      to: user,
      receiverId: user._id,
      callType,
      from: {
        _id: loggedInUser?._id!,
        name: loggedInUser?.name!,
        profilePic: loggedInUser?.profilePic,
      },
      callLog: call
    })
  }

  const createCallOnDB = async (caller: string, callee: string, callType: CallType): Promise<ICall | null> => {
    try {
      const { data } = await instance.post<ResponseWithData<ICall>>("/call/create", {
        caller,
        callee,
        callType,
      });
      return data.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      }
      console.error(error);
      return null;
    }
  }

  const updateCallOnDB = useCallback(async (callId: string, status: CallStatusDB, connectedAt?: Date, endedAt?: Date): Promise<boolean> => {
    const updateObj = {
      status,
      ...(connectedAt ? { connectedAt: connectedAt.toISOString() } : {}),
      ...(endedAt ? { endedAt: endedAt.toISOString() } : {})
    }
    try {
      await instance.put(`/call/${callId}`, updateObj);
      return true
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      }
      console.error(error);
      return false
    }
  }, [])

  const answerCall = async () => {
    if (!incomingCall) return;

    const lclStream = await setupMedia(incomingCall.callType);
    if (!lclStream) return;
    const peer = createPeerConnection(handleTrack, handleIceCandidate);
    peer.getSenders().forEach(sender => peer.removeTrack(sender));
    lclStream.getTracks().forEach(track => {
      peer.addTrack(track, lclStream);
    });

    await peer.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socket?.emit(SOCKET_EVENTS.CALL_ACCEPTED, {
      answer,
      to: incomingCall.from,
      receiverId: incomingCall.from._id,
      callType: incomingCall.callType,
      from: {
        _id: loggedInUser?._id!,
        name: loggedInUser?.name!,
        profilePic: loggedInUser?.profilePic,
      },
    })
    setCallStatus("connected");
    setCallType(incomingCall.callType);
    targetUser.current = incomingCall.from;
    setTargetUserState(incomingCall.from);
    setIncomingCall(null);
    await updateCallOnDB(callLogRef.current?._id!, "connected", new Date());
    addOrUpdateCallLog({ isUpdate: true, call: { ...callLogRef.current!, status: "connected", connectedAt: new Date().toISOString() } });
  }

  const resetState = useCallback(() => {
    closePeerConnection(localStream);
    setIsRinging(false);
    setIncomingCall(null);
    callLogRef.current = null;
  }, [localStream])

  const resetCalledUserState = useCallback(() => {
    targetUser.current = null;
    setTargetUserState(null);
    setCallType(undefined);
    setCallStatus("idle");
  }, [])

  const missedCall = useCallback((isLocalMissed = true) => {
    if (isLocalMissed) {
      const updatedCall: ICall = { ...callLogRef.current!, status: "missed" };
      socket?.emit(SOCKET_EVENTS.MISSED_CALL, {
        from: loggedInUser?._id!,
        to: targetUser.current?._id!,
        receiverId: targetUser.current?._id!,
        callInfo: updatedCall
      });
      addOrUpdateCallLog({ isUpdate: true, call: updatedCall });
    }
    resetState();
    setCallStatus("missed");
  }, [socket, loggedInUser, callType, resetState])

  const endCall = useCallback(async (isLocalEnd = true, beforeConnected = true) => {
    const call = { ...callLogRef.current! }
    if (isLocalEnd) {
      if (beforeConnected) {
        //emit missed call
        const updatedCall: ICall = { ...callLogRef.current!, status: "missed" };
        socket?.emit(SOCKET_EVENTS.MISSED_CALL, {
          from: loggedInUser?._id!,
          to: targetUser.current?._id!,
          receiverId: targetUser.current?._id!,
          callInfo: updatedCall
        })
        addOrUpdateCallLog({ isUpdate: true, call: updatedCall });
        resetCalledUserState();
      } else {
        socket?.emit(SOCKET_EVENTS.CALL_ENDED, {
          from: loggedInUser?._id!,
          to: targetUser.current?._id!,
          receiverId: targetUser.current?._id!,
        });
        setCallStatus("ended");
      }
      resetState();
    } else {
      resetState();
      setCallStatus("ended");
    }
    if (!beforeConnected) {
      await updateCallOnDB(call._id!, "connected", undefined, new Date());
      addOrUpdateCallLog({ isUpdate: true, call: { ...call, status: "connected", endedAt: new Date().toISOString() } });
    }
  }, [socket, resetState, loggedInUser, callType, resetCalledUserState, updateCallOnDB, addOrUpdateCallLog]);

  const onRejectCall = useCallback(async (isLocalReject = true) => {
    if (isLocalReject) {
      setCallStatus("idle");
      resetCalledUserState();
      socket?.emit(SOCKET_EVENTS.CALL_REJECTED, {
        from: loggedInUser?._id!,
        to: incomingCall?.from?._id!,
        receiverId: incomingCall?.from?._id!,
      });
      await updateCallOnDB(callLogRef.current?._id!, "rejected");
      addOrUpdateCallLog({ isUpdate: true, call: { ...callLogRef.current!, status: "rejected" } });
    } else { setCallStatus("rejected"); }
    resetState();
  }, [socket, resetState, loggedInUser, incomingCall, resetCalledUserState, updateCallOnDB, addOrUpdateCallLog]);

  const onUserBusy = useCallback(() => {
    setCallStatus("busy");
    resetState();
  }, [resetState]);

  const handleTrack = (remoteStream: MediaStream) => {
    setRemoteStream(remoteStream);
  }

  const handleIceCandidate = (candidate: RTCIceCandidate) => {
    if (targetUser.current && socket) {
      socket.emit(SOCKET_EVENTS.ICE_CANDIDATE, {
        candidate,
        from: loggedInUser?._id!,
        to: targetUser.current?._id!,
        receiverId: targetUser.current?._id!,
      });
    }
  }

  useEffect(() => {
    if (socket) {
      socket.on(SOCKET_EVENTS.CALL_MADE, (payload) => {
        if (callStatus === "connected" || callStatus === "incoming-ringing" || callStatus === "calling") {
          socket.emit(SOCKET_EVENTS.USER_BUSY, {
            from: loggedInUser?._id!,
            to: payload.from._id,
            receiverId: payload.from._id,
          });
          return;
        }
        const { callType, from, offer, callLog } = payload;
        setCallStatus("incoming-ringing");
        socket.emit(SOCKET_EVENTS.CALL_RINGING, {
          from: loggedInUser?._id!,
          to: from._id,
          receiverId: from._id,
        })
        setIncomingCall({
          callType,
          from,
          offer
        });
        addOrUpdateCallLog({ isUpdate: false, call: callLog, otherUser: from })
      });

      socket.on(SOCKET_EVENTS.CALL_ACCEPTED, async (payload) => {
        const { answer, callType } = payload;
        const peer = getPeer();
        if (peer) {
          await peer.setRemoteDescription(new RTCSessionDescription(answer))
        }
        setCallStatus("connected");
        setCallType(callType);
        addOrUpdateCallLog({ isUpdate: true, call: { ...callLogRef.current!, status: "connected", connectedAt: new Date().toISOString() } });
      });

      socket.on(SOCKET_EVENTS.CALL_ENDED, async () => {
        await endCall(false);
      });

      socket.on(SOCKET_EVENTS.ICE_CANDIDATE, async (payload) => {
        const { candidate } = payload;
        const peer = getPeer();
        if (peer) {
          await peer.addIceCandidate(new RTCIceCandidate(candidate))
        }
      });

      socket.on(SOCKET_EVENTS.CALL_REJECTED, async () => {
        addOrUpdateCallLog({ isUpdate: true, call: { ...callLogRef.current!, status: "rejected" } });
        await onRejectCall(false);
      });

      socket.on(SOCKET_EVENTS.CALL_RINGING, async () => {
        setIsRinging(true);
      });

      socket.on(SOCKET_EVENTS.USER_BUSY, async () => {
        onUserBusy();
      });

      socket.on(SOCKET_EVENTS.MISSED_CALL, async (payload) => {
        toast.info("Missed call from " + incomingCall?.from.name);
        await updateCallOnDB(payload.callInfo._id, "missed");
        addOrUpdateCallLog({ isUpdate: true, call: { ...payload.callInfo, status: "missed" } });
        setCallStatus("idle");
        setIncomingCall(null);
        callLogRef.current = null;
      });

      socket.on(SOCKET_EVENTS.TOGGLE_VIDEO, (payload) => {
        const { isVideoOn } = payload;
        setRemoteMediaStatus(prev => ({ ...prev, video: isVideoOn }))
      });

      socket.on(SOCKET_EVENTS.TOGGLE_AUDIO, (payload) => {
        const { isAudioOn } = payload;
        setRemoteMediaStatus(prev => ({ ...prev, audio: isAudioOn }))
      });
    }

    return () => {
      if (socket) {
        socket.off(SOCKET_EVENTS.CALL_MADE);
        socket.off(SOCKET_EVENTS.CALL_ACCEPTED);
        socket.off(SOCKET_EVENTS.CALL_ENDED);
        socket.off(SOCKET_EVENTS.ICE_CANDIDATE);
        socket.off(SOCKET_EVENTS.CALL_REJECTED);
        socket.off(SOCKET_EVENTS.CALL_RINGING);
        socket.off(SOCKET_EVENTS.USER_BUSY);
        socket.off(SOCKET_EVENTS.MISSED_CALL);
        socket.off(SOCKET_EVENTS.TOGGLE_VIDEO);
        socket.off(SOCKET_EVENTS.TOGGLE_AUDIO);
      }
    }
  }, [socket, endCall, onRejectCall, loggedInUser, callStatus, onUserBusy, addOrUpdateCallLog, updateCallOnDB, incomingCall]);

  return (
    <WebRTCContext.Provider value={{
      answerCall,
      callStatus,
      callUser,
      endCall,
      incomingCall,
      callType,
      remoteStream,
      localStream,
      targetUser: targetUserState,
      isRinging,
      onRejectCall,
      resetCalledUserState,
      missedCall,
      toggleMedia,
      remoteMediaStatus,
      socket
    }}>
      {children}
    </WebRTCContext.Provider>
  )
}

export const useWebRTC = () => {
  const context = useContext(WebRTCContext);
  if (!context) {
    throw new Error("useWebRTC must be used within a WebRTCProvider");
  }
  return context;
}