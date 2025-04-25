import { CallStatus, CallType, IncomingCall, WebRTCContextType } from "@/interface/webRtcInterface";
import { closePeerConnection, createPeerConnection, getLocalStream, getPeer } from "@/services/webRtc";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSocket } from "./socketContext";
import { SOCKET_EVENTS } from "@/utils/constants";
import { useAppSelector } from "@/hooks/hooks";
import { IUserShort } from "@/interface/interface";
import { toast } from "sonner";

export const WebRTCContext = createContext<WebRTCContextType | null>(null);

export const WebRTCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  // const [callAccepted, setCallAccepted] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus | null>(null);
  const [callType, setCallType] = useState<CallType>();

  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

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
    if(!lclStream) return;
    const peer = createPeerConnection(handleTrack, handleIceCandidate);

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
    setCallType(callType);
  }

  const answerCall = async () => {
    if (!incomingCall) return;

    const lclStream = await setupMedia(incomingCall.callType);
    if(!lclStream) return;
    const peer = createPeerConnection(handleTrack, handleIceCandidate);

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
    setIncomingCall(null);
  }

  const endCall = (isLocalEnd = true) => {
    if (isLocalEnd) {
      socket?.emit(SOCKET_EVENTS.CALL_ENDED, {
        from: loggedInUser?._id!,
        to: targetUser.current?._id!,
        receiverId: targetUser.current?._id!,
      });
    }
    targetUser.current = null;
    closePeerConnection(localStream);
    setCallStatus("ended");
    setIncomingCall(null);
    setCallType(undefined);
  }

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
        console.log("Incoming call", payload);
        const { callType, from, offer } = payload;
        setCallStatus("incoming-ringing");
        setIncomingCall({
          callType,
          from,
          offer
        });
      });

      socket.on(SOCKET_EVENTS.CALL_ACCEPTED, async (payload) => {
        console.log("Call accepted", payload);
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
    }

    return () => {
      if (socket) {
        socket.off(SOCKET_EVENTS.CALL_MADE);
        socket.off(SOCKET_EVENTS.CALL_ACCEPTED);
        socket.off(SOCKET_EVENTS.CALL_ENDED);
        socket.off(SOCKET_EVENTS.ICE_CANDIDATE);
      }
    }
  }, [socket, endCall]);

  return (
    <WebRTCContext.Provider value={{
      answerCall,
      callStatus,
      callUser,
      endCall,
      incomingCall,
      callType,
      remoteStream,
      localStream
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