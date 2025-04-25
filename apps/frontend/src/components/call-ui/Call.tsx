import { useWebRTC } from '@/context/WebRTCContext';
import { IUser } from '@/interface/interface';
import { cn } from '@/lib/utils';
import clsx from "clsx";
import { Maximize, Mic, MicOff, Minimize2, Phone, Video, VideoOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import defaultAvatar from "../../assets/defaultAvatar.jpg";
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import AudioWave from './AudioWave';
import DraggableBox from './Dragable';
import IncomingCall from './IncomingCall';

// navigator.mediaDevices.getUserMedia({
//   audio: {
//     echoCancellation: true,
//     noiseSuppression: true,
//     autoGainControl: true
//   },
//   video: {
//     width: { ideal: 1280 },
//     height: { ideal: 720 },
//     frameRate: { ideal: 30 },
//     facingMode: 'user'
//   }
// });

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

  const {
    answerCall,
    callType,
    endCall,
    callStatus,
    incomingCall,
    localStream,
    remoteStream
  } = useWebRTC();

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      console.log("Setting local video stream");
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (callType === "video") {
      if (remoteVideoRef.current && draggableRemoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
        draggableRemoteVideoRef.current.srcObject = remoteStream;
      }
    } else {
      if (remoteAudioRef.current && draggableRemoteAudioRef.current && remoteStream) {
        remoteAudioRef.current.srcObject = remoteStream;
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

  if (!callStatus || callStatus === "ended") {
    return null;
  }
  if (callStatus === "calling") {
    return (
      <div className={cn(
        "fixed inset-0 bg-primary-6 dark:bg-gray-900 flex flex-col z-[100]",
        "transition-opacity duration-300 ease-in-out",
        isMinimized ? "opacity-0 pointer-events-none" : "opacity-100"
      )}>
        <h1>Calling</h1>
      </div>
    )
  }

  if (incomingCall && callStatus === "incoming-ringing") {
    return (
      <IncomingCall
        callType={incomingCall.callType}
        userName={incomingCall.from.name}
        userAvatar={incomingCall.from.profilePic?.avatar}
        onReject={endCall}
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
          <div className="w-full h-full rounded-full bg-primary-4 p-2 dark:bg-primary-3 flex items-center justify-center">
            {callType === 'video' ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-lg"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-primary-5 dark:bg-gray-700 flex items-center justify-center">
                <Avatar className="w-full h-full select-none pointer-events-none">
                  <AvatarImage className='object-cover' src={user.profilePic ? user.profilePic.avatar : defaultAvatar} alt="user" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </DraggableBox>

        <div className="flex-1 relative">
          {callType === 'video' ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <audio
                ref={remoteAudioRef}
                autoPlay
                playsInline
                className="hidden"
              />
              {!isMinimized && <AudioWave
                stream={remoteStream}
              />}
            </div>
          )}
        </div>

        {!isMinimized && <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 md:gap-6">
          <button
            className='p-4 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-lg transition-all'
            onClick={handleMiniAndMaxize}
          >
            <Minimize2 className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            // onClick={() => {
            //   toggleMedia('audio', !isMuted);
            //   setIsMuted(!isMuted);
            // }}
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
              // onClick={() => {
              //   toggleMedia('video', !isVideoOff);
              //   setIsVideoOff(!isVideoOff);
              // }}
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
            onClick={endCall}
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
        {/* <button onClick={() => setOpen(true)}>call</button> */}
        <div className="flex-1 relative">
          {callType === 'video' ? (
            <video
              ref={draggableRemoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
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
              />
            </div>
          )}
        </div>
      </DraggableBox>
    </>
  );
};

export default Call;