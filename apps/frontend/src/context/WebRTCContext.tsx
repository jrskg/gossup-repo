import { useAppSelector } from "@/hooks/hooks";
import { IUserShort } from "@/interface/interface";
import { CallStatus, CallType, IncomingCall, WebRTCContextType } from "@/interface/webRtcInterface";
import { closePeerConnection, createPeerConnection, getLocalStream, getPeer } from "@/services/webRtc";
import { SOCKET_EVENTS } from "@/utils/constants";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useSocket } from "./socketContext";

export const WebRTCContext = createContext<WebRTCContextType | null>(null);

export const WebRTCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  // const [callAccepted, setCallAccepted] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isRinging, setIsRinging] = useState(false);
  const [callType, setCallType] = useState<CallType>();

  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [targetUserState, setTargetUserState] = useState<IUserShort | null>(null);

  const targetUser = useRef<IUserShort | null>(null);

  const { socket } = useSocket();
  const { user: loggedInUser } = useAppSelector(state => state.user);

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
    console.log("Calling user", user);
    const lclStream = await setupMedia(callType);
    if (!lclStream) return;
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
    })
    setCallStatus("calling");
    targetUser.current = user;
    setTargetUserState(user);
    setCallType(callType);
  }

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
  }

  const resetState = useCallback(() => {
    closePeerConnection(localStream);
    setIsRinging(false);
    setIncomingCall(null);

    // setCallStatus("idle"); // handled separately
    // setCallType(undefined);
    // targetUser.current = null;
    // setTargetUserState(null);
  }, [localStream])

  const resetCalledUserState = useCallback(() => {
    targetUser.current = null;
    setTargetUserState(null);
    setCallType(undefined);
    setCallStatus("idle");
  }, [])

  const missedCall = useCallback((isLocalMissed = true) => {
    if (isLocalMissed) {
      socket?.emit(SOCKET_EVENTS.MISSED_CALL, {
        from: loggedInUser?._id!,
        to: targetUser.current?._id!,
        receiverId: targetUser.current?._id!,
        callInfo:{
          caller: loggedInUser?._id!,
          callee: targetUser.current?._id!,
          callType: callType!,
          status: "missed",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      })
    }
    resetState();
    setCallStatus("missed");
  }, [socket, loggedInUser, callType, resetState])

  const endCall = useCallback((isLocalEnd = true, beforeConnected = true) => {
    if (isLocalEnd) {
      if (beforeConnected) {
        //emit missed call
        socket?.emit(SOCKET_EVENTS.MISSED_CALL, {
          from: loggedInUser?._id!,
          to: targetUser.current?._id!,
          receiverId: targetUser.current?._id!,
          callInfo:{
            caller: loggedInUser?._id!,
            callee: targetUser.current?._id!,
            callType: callType!,
            status: "missed",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        })
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
  }, [socket, resetState, loggedInUser, callType, resetCalledUserState]);

  const onRejectCall = useCallback((isLocalReject = true) => {
    if (isLocalReject) {
      setCallStatus("idle");
      resetCalledUserState();
      socket?.emit(SOCKET_EVENTS.CALL_REJECTED, {
        from: loggedInUser?._id!,
        to: incomingCall?.from?._id!,
        receiverId: incomingCall?.from?._id!,
      });
    } else { setCallStatus("rejected"); }
    resetState();
  }, [socket, resetState, loggedInUser, incomingCall, resetCalledUserState]);

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
        const { callType, from, offer } = payload;
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
      });

      socket.on(SOCKET_EVENTS.CALL_ACCEPTED, async (payload) => {
        const { answer, callType } = payload;
        const peer = getPeer();
        if (peer) {
          await peer.setRemoteDescription(new RTCSessionDescription(answer))
        }
        setCallStatus("connected");
        setCallType(callType);
      });

      socket.on(SOCKET_EVENTS.CALL_ENDED, (payload) => {
        console.log("Call ended", payload);
        endCall(false);
      });

      socket.on(SOCKET_EVENTS.ICE_CANDIDATE, async (payload) => {
        const { candidate } = payload;
        const peer = getPeer();
        if (peer) {
          await peer.addIceCandidate(new RTCIceCandidate(candidate))
        }
      });

      socket.on(SOCKET_EVENTS.CALL_REJECTED, async (payload) => {
        console.log("Call rejected", payload);
        onRejectCall(false);
      });

      socket.on(SOCKET_EVENTS.CALL_RINGING, async (payload) => {
        console.log("Call ringing", payload);
        setIsRinging(true);
      });

      socket.on(SOCKET_EVENTS.USER_BUSY, async (payload) => {
        console.log("User busy", payload);
        onUserBusy();
      })

      socket.on(SOCKET_EVENTS.MISSED_CALL, async (payload) => {
        console.log("missed call", payload);
        setCallStatus("idle");
        setIncomingCall(null);
        toast.info("Missed call from " + payload.callInfo.caller);
      })
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
      }
    }
  }, [socket, endCall, onRejectCall, loggedInUser, callStatus, onUserBusy]);

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
      setCallStatus,
      resetCalledUserState,
      missedCall
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