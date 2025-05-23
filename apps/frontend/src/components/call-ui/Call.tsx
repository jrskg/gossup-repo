import { useWebRTC } from '@/context/WebRTCContext';
import { useCallTimeOut } from '@/hooks/callHooks';
import { IUser } from '@/interface/interface';
import { cn } from '@/lib/utils';
import { SOCKET_EVENTS } from '@/utils/constants';
import { getTimeString } from '@/utils/utility';
import clsx from "clsx";
import { Maximize, Mic, MicOff, Minimize2, Phone, Video, VideoOff } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import AudioWave from './AudioWave';
import CallAvatar from './CallAvatar';
import CallDuration, { CallDurationRef } from './CallDuration';
import CallStateStatus from './CallStateStatus';
import DraggableBox from './Dragable';
import IncomingCall from './IncomingCall';
import OwnCallProfile from './OwnCallProfile';

interface CallProps {
  user: IUser
}
const Call: React.FC<CallProps> = ({ user }) => {
  console.log('Call component rendered');

  const [isMinimized, setIsMinimized] = useState(false);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const draggableRemoteVideoRef = useRef<HTMLVideoElement>(null);
  const draggableRemoteAudioRef = useRef<HTMLAudioElement>(null);

  const callDurationRef = useRef<CallDurationRef>(null);

  const {
    answerCall,
    callType,
    endCall,
    callStatus,
    incomingCall,
    localStream,
    remoteStream,
    targetUser,
    isRinging,
    onRejectCall,
    callUser,
    resetCalledUserState,
    missedCall,
    toggleMedia,
    remoteMediaStatus,
    socket
  } = useWebRTC();

  const toggleMyMedia = (media: "audio" | "video") => {
    const payloadForSocket = {
      from: user._id,
      to: targetUser?._id!,
      receiverId: targetUser?._id!
    }
    if (media === "audio") {
      setIsMuted(prev => {
        toggleMedia(media, prev);
        if (socket) socket.emit(SOCKET_EVENTS.TOGGLE_AUDIO, {
          ...payloadForSocket,
          isAudioOn: prev
        });
        return !prev;
      });
    } else {
      setIsVideoOff(prev => {
        toggleMedia(media, prev);
        if (socket) socket.emit(SOCKET_EVENTS.TOGGLE_VIDEO, {
          ...payloadForSocket,
          isVideoOn: prev
        })
        return !prev;
      });
    }
  }

  const onCallTimeOut = useCallback(() => {
    missedCall(true);
  }, [missedCall])

  useCallTimeOut(40, callStatus, onCallTimeOut);

  useEffect(() => {
    if (!localStream) return;
    if (callType === "video" && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callType]);

  useEffect(() => {
    if (!remoteStream) return;
    if (callType === "video") {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }

      if (draggableRemoteVideoRef.current) {
        draggableRemoteVideoRef.current.srcObject = remoteStream;
      }
    } else {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
      }
      if (draggableRemoteAudioRef.current) {
        draggableRemoteAudioRef.current.srcObject = remoteStream;
      }
    }
  }, [remoteStream, callType]);

  const handleMiniAndMaxize = () => {
    setIsMinimized(prev => {
      if (prev) {
        draggableRemoteAudioRef.current?.pause();
        draggableRemoteVideoRef.current?.pause();
        remoteAudioRef.current?.play();
        remoteVideoRef.current?.play();
        localVideoRef.current?.play();
      } else {
        draggableRemoteAudioRef.current?.play();
        draggableRemoteVideoRef.current?.play();
        remoteAudioRef.current?.pause();
        remoteVideoRef.current?.pause();
        localVideoRef.current?.pause();
      }
      return !prev;
    })
  }

  const callAgain = useCallback(() => {
    if (targetUser && callType) {
      callUser(targetUser, callType);
    }
    else {
      toast.error("Something went wrong, try again later");
    }
  }, [callUser, callType, targetUser]);

  if (callStatus === "idle") {
    return null;
  }
  else if (callStatus === "ended") {
    return <CallStateStatus
      onCallAgain={callAgain}
      onClose={resetCalledUserState}
      status='ended'
      userName={targetUser?.name || ""}
      avatar={targetUser?.profilePic?.avatar}
      duration={callDurationRef.current?.timeInSec ? getTimeString(callDurationRef.current.timeInSec) : undefined}
      endedAt={new Date().toLocaleDateString()}
    />
  }
  else if (callStatus === "rejected") {
    return <CallStateStatus
      onCallAgain={callAgain}
      onClose={resetCalledUserState}
      status='rejected'
      userName={targetUser?.name || ""}
      avatar={targetUser?.profilePic?.avatar}
    />
  }
  else if (callStatus === "busy") {
    return <CallStateStatus
      onCallAgain={callAgain}
      onClose={resetCalledUserState}
      status='busy'
      userName={targetUser?.name || ""}
      avatar={targetUser?.profilePic?.avatar}
    />
  }
  else if (callStatus === "missed") {
    return <CallStateStatus
      onCallAgain={callAgain}
      onClose={resetCalledUserState}
      status='missed'
      userName={targetUser?.name || ""}
      avatar={targetUser?.profilePic?.avatar}
    />
  }
  else if (incomingCall && callStatus === "incoming-ringing") {
    return (
      <IncomingCall
        callType={incomingCall.callType}
        userName={incomingCall.from.name}
        userAvatar={incomingCall.from.profilePic?.avatar}
        onReject={onRejectCall}
        onAccept={answerCall}
      />
    )
  }

  return (
    <>
      <div className={cn(
        "fixed inset-0 bg-primary-6 dark:bg-gray-900 flex flex-col z-[100]",
        "transition-opacity duration-300 ease-in-out",
        isMinimized ? "opacity-0 pointer-events-none" : "opacity-100"
      )}>
        <DraggableBox
          className={clsx('w-36 h-36 md:w-56 md:h-56', callType === "audio" ? "hidden md:flex" : "flex")}
        >
          <div className="w-full h-full rounded-full bg-primary-4 p-2 dark:bg-primary-3 flex items-center justify-center overflow-hidden">
            {callType === 'video' ? (
              <>
                {isVideoOff && !isMinimized && (
                  <OwnCallProfile user={user} />
                )}
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={cn("w-full h-full rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-lg", isVideoOff && "hidden")}
                />
              </>
            ) : (
              <OwnCallProfile user={user} />
            )}
          </div>
        </DraggableBox>

        <div className="flex-1 relative">
          {callStatus === "connected" && <CallDuration ref={callDurationRef} />}
          {
            callStatus === "calling" && !isMinimized && (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <CallAvatar
                  avatar={targetUser?.profilePic?.avatar}
                />

                <div className="text-center">
                  <h2 className="text-lg font-semibold">{targetUser?.name}</h2>
                  <p className="text-lg mt-1 font-bold">{callStatus}</p>
                </div>
                <p className="text-lg text-success">{isRinging ? "Ringing..." : "Calling..."}</p>
              </div>
            )
          }
          {
            callStatus === "connected" && (
              callType === 'video' ? (
                <>
                  {!remoteMediaStatus.audio && remoteMediaStatus.video &&
                    <MicOff className='absolute right-10 top-10 w-8 h-8 text-danger'/>
                  }
                  {!remoteMediaStatus.video && !isMinimized && <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center bg-primary-6 dark:bg-dark-2'>
                    <div className='flex flex-col items-center gap-2'>
                      <CallAvatar avatar={targetUser?.profilePic?.avatar} />
                      <p className='text-lg'>{targetUser?.name}</p>
                      <div className='flex gap-5 mt-5'>
                        <VideoOff className='text-danger' />
                        {!remoteMediaStatus.audio && <MicOff className='text-danger' />}
                      </div>
                    </div>
                  </div>}
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <audio
                    ref={remoteAudioRef}
                    autoPlay
                    playsInline
                    className="hidden"
                  />
                  {!isMinimized && <AudioWave
                    stream={remoteStream}
                    userIcon={targetUser?.profilePic?.avatar}
                  />}
                  <p className='text-lg font-bold mt-10'>{targetUser?.name}</p>
                  {!remoteMediaStatus.audio && <MicOff className='text-danger mt-5' />}
                </div>
              )
            )
          }
        </div>

        {!isMinimized && <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 md:gap-6">
          <button
            className='p-4 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-lg transition-all'
            onClick={handleMiniAndMaxize}
          >
            <Minimize2 className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={() => {
              toggleMyMedia("audio");
            }}
            className="p-4 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-lg transition-all"
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 text-red-500" />
            ) : (
              <Mic className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            )}
          </button>

          {callType === 'video' && (
            <button
              onClick={() => {
                toggleMyMedia("video");
              }}
              className="p-4 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-lg transition-all"
            >
              {isVideoOff ? (
                <VideoOff className="w-6 h-6 text-red-500" />
              ) : (
                <Video className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          )}

          <button
            onClick={async () => await endCall(true, callStatus !== "connected")}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 shadow-lg transition-all"
          >
            <Phone className="w-6 h-6 text-white" />
          </button>
        </div>}
      </div>

      <DraggableBox
        className={clsx(
          'group w-28 h-36 md:w-48 md:h-56 bg-gray-500 dark:bg-gray-900 rounded-sm shadow-2xl',
          'flex items-center justify-center z-[100] fixed',
          'transition-opacity duration-300 ease-in-out',
          isMinimized ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <Maximize
          className="absolute opacity-0 group-hover:opacity-100 top-2 right-2 w-6 h-6 text-white cursor-pointer transition-all duration-200"
          onClick={handleMiniAndMaxize}
        />
        {!remoteMediaStatus.audio && <MicOff className='absolute top-2 left-2 w-6 h-6 text-danger' />}
        {!remoteMediaStatus.video && <VideoOff className='absolute top-2 left-11 w-6 h-6 text-danger' />}
        <div className="flex-1 relative">
          {callStatus === "calling" && isMinimized && (
            <div className='flex items-center justify-center'>
              <CallAvatar
                avatar={targetUser?.profilePic?.avatar}
                className='w-28 h-28 md:w-44 md:h-44'
              />
            </div>
          )}
          {callStatus === "connected" && (
            callType === 'video' ? (
              <>
              {!remoteMediaStatus.video && <div className='w-full h-full flex justify-center items-center'>
                <CallAvatar
                  avatar={targetUser?.profilePic?.avatar}
                  className='w-32 h-32 md:w-40 md:h-40'
                />
                </div>}
              <video
                ref={draggableRemoteVideoRef}
                autoPlay
                playsInline
                className={cn("w-full h-full object-contain", !remoteMediaStatus.video && "hidden")}
              />
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <audio
                  ref={draggableRemoteAudioRef}
                  autoPlay
                  playsInline
                  className="hidden"
                />
                <AudioWave
                  className='w-16 h-16'
                  stream={remoteStream}
                  userIcon={targetUser?.profilePic?.avatar}
                />
              </div>
            )
          )}
        </div>
      </DraggableBox>
    </>
  );
};

export default Call;