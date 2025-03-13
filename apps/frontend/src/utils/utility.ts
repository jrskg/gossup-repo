// import { toast } from "sonner";

// const checkConnection = async (): Promise<boolean> => {
//   try {
//     const response = await fetch("https://www.google.com", {
//       method: "HEAD",
//       mode: "no-cors",
//     });
//     return response.ok;
//   } catch (error) {
//     toast.error("Please check your internet connection");
//     return false;
//   }
// }

// export { checkConnection }

import type { ChatType, FileType, ILastMessage } from '@/interface/chatInterface';
import { format, isAfter, isSameDay, isSameYear, subDays } from 'date-fns';

const toggleDarkMode = (setDarkMode: boolean) => {
  const list = document.documentElement.classList;
  if (setDarkMode) {
    list.add('dark')
    list.remove('light')
  }
  else {
    list.remove('dark')
    list.add('light')
  }
}

const getDateStr = (createdAt: string) => {
  const date = new Date(createdAt)
  const currDate = new Date(Date.now())
  const diffDays = Math.floor((currDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' })}`
  } else if (diffDays === 1) {
    return "Yesterday"
  } else if (diffDays <= 6) {
    return `${diffDays} days ago`
  }
  return Math.floor(diffDays / 7) + " weeks ago";
}

const getMessageTimestamp = (date?: Date): { time: string, date?: string } => {
  if (!date) {
    return { time: "", date: "" };
  }
  const now = new Date();
  if (isSameDay(date, now)) {
    return { time: format(date, 'p'), date: "Today" }; // "10:45 AM"
  }
  if (isSameDay(date, subDays(now, 1))) {
    // return `Yesterday, ${format(date, 'p')}`; // "Yesterday, 9:30 PM"
    return {
      time: format(date, 'p'),
      date: 'Yesterday'
    }
  }
  if (isAfter(date, subDays(now, 7))) {
    // return format(date, 'EEE, p'); // "Wed, 2:15 PM"
    return {
      time: format(date, 'p'),
      date: format(date, 'EEE')
    }
  }
  if (isSameYear(date, now)) {
    // return format(date, 'd MMM, p'); // "11 Jun, 5:00 PM"
    return {
      time: format(date, 'p'),
      date: format(date, 'd MMM')
    }
  }
  // return format(date, 'd MMM yyyy'); // "11 Jun 2023, 5:00 PM"
  return {
    time: format(date, 'p'),
    date: format(date, 'd MMM yyyy')
  }
};

const getMainConatainerStyle = (sId: string, lguId: string): string => {
  return sId === lguId ?
    'flex-row-reverse' :
    'flex-row gap-2';
}
const getAvatarStyle = (sId: string, lguId: string, chType: ChatType, psId?: string): string => {
  if (chType === "one-to-one") {
    return "hidden";
  }
  else if (chType === "group") {
    if (sId === lguId || sId === psId) {
      return "hidden";
    }
  }
  return "block";
}
const getMessageBoxStyle = (sId: string, lguId: string, chType: ChatType, psId?: string): string => {
  const isAvatarVisible = getAvatarStyle(sId, lguId, chType, psId) === "block";
  if (sId === lguId) {
    return sId === psId ? "mr-2 rounded-xl" : "mr-2 rounded-xl rounded-tr-none";
    // return sId === psId ? "rounded-3xl" : "rounded-3xl rounded-tr-none";
  } else if (chType === "one-to-one") {
    // return sId === psId ? "rounded-3xl" : "rounded-3xl rounded-tl-none";
    return sId === psId ? "ml-2 rounded-xl" : "ml-2 rounded-xl rounded-tl-none";
  }
  return isAvatarVisible ? "rounded-xl rounded-tl-none" : "rounded-xl ml-10";
}

const getTriangleStyle = (sId: string, lguId: string, psId?: string): string => {
  if (sId === lguId) {
    return sId === psId ? "hidden" : "-right-3";
  }
  return sId === psId ? "hidden" : "-left-3";
}

const getNameStyle = (sId: string, lguId: string, chType: ChatType, psId?: string): string => {
  if (sId === lguId) {
    return "hidden";
  }
  return getAvatarStyle(sId, lguId, chType, psId);
}

const getDateStyle = (sId: string, lguId: string, chType: ChatType): string => {
  if (sId === lguId) {
    return "right-4";
  }
  else if (chType === "group" && sId !== lguId) {
    return "left-12";
  }
  else if (chType === "one-to-one" && sId !== lguId) {
    return "left-4";
  }
  return "";
}

const getLastMessageText = (lastMessage?: ILastMessage): string => {
  if (!lastMessage) return "";
  if (lastMessage.messageType === "text") return lastMessage.content;
  return "Sent an attachment";
}

const getMapFromArray = <T extends {_id: string}, U extends Record<string, T>>(arr: T[]): 
{map:U, orderedIds:string[]} => {
  const map:Record<string, T> = {};
  const orderedIds:string[] = [];
  arr.forEach(p => {
    map[p._id] = p;
    orderedIds.push(p._id);
  });
  return {map: map as U, orderedIds};
}

function throttle(func: Function, limit: number) {
  let lastCall = 0;
  return function (...args: any) {
    const now = new Date().getTime();
    if (now - lastCall >= limit) {
      lastCall = now;
      func(...args);
    }
  }
}

const generateFileId = (file: File): string => {
  return `${file.name.slice(0, 10)}-${file.size}-${file.lastModified}`;
};

const getFileType = (mimeType: string): FileType => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "other";
};

const getFileExtension = (fileName: string): string | null => {
  const extensionMatch = fileName.match(/\.(\w+)$/);
  return extensionMatch ? extensionMatch[1] : null;
};

export {
  getFileExtension,
  generateFileId,
  getFileType,
  getAvatarStyle,
  getDateStr,
  getDateStyle,
  getLastMessageText,
  getMainConatainerStyle,
  getMapFromArray,
  getMessageBoxStyle,
  getMessageTimestamp,
  getNameStyle, getTriangleStyle,
  throttle, toggleDarkMode
};

