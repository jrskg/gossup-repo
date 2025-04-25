import { CallType } from '@/interface/webRtcInterface';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Mic, Phone, PhoneOff, Video } from 'lucide-react';
import defaultAvatar from '../../assets/defaultAvatar.jpg';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog';

{/* <div className="fixed inset-0 bg-black/50 dark:bg-gray-900/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"> */ }


interface IncomingCallProps {
  userName: string;
  userAvatar?: string;
  callType: CallType;
  onAccept: () => void;
  onReject: () => void;
}

const IncomingCall: React.FC<IncomingCallProps> = ({
  userName,
  userAvatar,
  callType,
  onAccept,
  onReject,
}) => {
  return (
    <Dialog
      open={true}
    >
      <DialogContent className="p-0 border-none bg-transparent [&>button]:hidden">
        <VisuallyHidden>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </VisuallyHidden>
        <div className="w-full max-w-md h-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 flex flex-col items-center justify-between gap-6">
          {/* Avatar Section */}
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center relative overflow-hidden">
              <Avatar className="w-full h-full select-none pointer-events-none">
                <AvatarImage className='object-cover' src={userAvatar ? userAvatar : defaultAvatar} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              {/* Ringing animation */}
              <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-call-pulse" />
            </div>
          </div>

          {/* User Info */}
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {userName}
            </h2>
            <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
              {callType === 'video' ? (
                <>
                  <Video className="w-5 h-5" />
                  <span className="text-lg">Incoming Video Call</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span className="text-lg">Incoming Voice Call</span>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-4 mt-4">
            <button
              onClick={onAccept}
              className="w-full flex items-center justify-center gap-3 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
            >
              <Phone className="w-6 h-6" />
              <span className="text-lg font-medium">Accept</span>
            </button>

            <button
              onClick={onReject}
              className="w-full flex items-center justify-center gap-3 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
            >
              <PhoneOff className="w-6 h-6" />
              <span className="text-lg font-medium">Decline</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IncomingCall;