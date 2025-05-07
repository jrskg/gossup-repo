import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PhoneOff, PhoneMissed, PhoneIncoming, PhoneCall } from "lucide-react";
import defaultAvatar from "../../assets/defaultAvatar.jpg";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface CallStatusModalProps {
  userName: string;
  avatar?: string;
  status: "ended" | "rejected" | "busy" | "missed";
  duration?: string;
  endedAt?: string;
  onCallAgain: () => void;
  onClose: () => void;
}

const statusConfig = {
  ended: {
    title: "Call Ended",
    icon: <PhoneOff className="w-5 h-5 text-red-500" />,
  },
  rejected: {
    title: "Call Rejected",
    icon: <PhoneMissed className="w-5 h-5 text-red-500" />,
  },
  busy: {
    title: "User Busy",
    icon: <PhoneIncoming className="w-5 h-5 text-yellow-500" />,
  },
  missed: {
    title: "Not Reachable",
    icon: <PhoneMissed className="w-5 h-5 text-red-500" />,
  },
};

function CallStateStatus({
  userName,
  avatar,
  status,
  duration,
  endedAt,
  onCallAgain,
  onClose,
}: CallStatusModalProps) {
  const { title, icon } = statusConfig[status];

  const getMessage = () => {
    if (status === "ended") {
      return (
        <div className="space-y-1">
          <p className="text-lg text-gray-600 dark:text-primary-6">Duration: <span className="font-semibold">{duration}</span></p>
          <p className="text-sm text-gray-600 dark:text-dark-6">Ended at {endedAt}</p>
        </div>
      );
    }

    if (status === "rejected") {
      return (
        <p className="text-sm text-gray-600 dark:text-primary-6">
          <span className="font-medium">{userName}</span> rejected your call.
        </p>
      );
    }

    if (status === "busy") {
      return (
        <p className="text-sm text-gray-600 dark:text-primary-6">
          <span className="font-medium">{userName}</span> is currently on another call.
        </p>
      );
    }

    if (status === "missed") {
      return (
        <p className="text-sm text-gray-600 dark:text-primary-6">
          <span className="font-medium">{userName}</span> is not reachable.
        </p>
      );
    }

    return null;
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md dark:bg-dark-2 dark:border-dark-4 bg-gray-100 border rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-primary-4">
            {icon} {title}
          </DialogTitle>
        </DialogHeader>
        <VisuallyHidden>
          <DialogDescription></DialogDescription>
        </VisuallyHidden>

        <div className="flex flex-col items-center text-center space-y-4">
          <Avatar className="w-32 h-32 ring-2 ring-primary-3 dark:ring-primary-4">
            <AvatarImage src={avatar ? avatar : defaultAvatar} alt={userName} />
            <AvatarFallback className="bg-primary-4 text-white">{userName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{userName}</h2>
          {getMessage()}
        </div>

        <DialogFooter className="flex gap-3 justify-center pt-5">
          <Button
            variant="outline"
            className="dark:border-dark-4 dark:text-white hover:bg-gray-100 dark:hover:bg-dark-3 transition"
            onClick={onClose}
          >
            Close
          </Button>

          <Button
            onClick={onCallAgain}
            className="bg-success text-white flex items-center"
          >
            <PhoneCall className="w-4 h-4 mr-1" /> Call Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CallStateStatus;
