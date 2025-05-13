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

import type { ChatType, FileType } from '@/interface/chatInterface';
import { differenceInHours, differenceInMinutes, differenceInSeconds, format, isAfter, isSameDay, isSameYear, subDays } from 'date-fns';

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

const getMessageTimestamp = (date?: Date): { time: string, date: string } => {
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
      date: format(date, 'EEEE')
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

const getSmartTimestamp = (date?: Date): string => {
  if (!date) return "";

  const now = new Date();
  const seconds = differenceInSeconds(now, date);
  const minutes = differenceInMinutes(now, date);
  const hours = differenceInHours(now, date);

  if (seconds < 5) return "Just now";
  if (seconds < 60) return `${seconds} sec ago`;
  if (minutes < 60) return minutes === 1 ? `1 min ago` : `${minutes} mins ago`;

  // Less than 24 hours -> show actual time
  if (hours < 24 && isSameDay(date, now)) {
    return format(date, 'p'); // e.g., 2:45 PM
  }

  // Yesterday
  if (isSameDay(date, subDays(now, 1))) {
    return `Yesterday, ${format(date, 'p')}`;
  }

  // Last 7 days
  if (isAfter(date, subDays(now, 7))) {
    return `${format(date, 'EEEE')}, ${format(date, 'p')}`; // Monday, 2:30 PM
  }

  // Same year
  if (isSameYear(date, now)) {
    return `${format(date, 'd MMM')}, ${format(date, 'p')}`; // 11 Apr, 5:00 PM
  }

  // Older
  return `${format(date, 'd MMM yyyy')}, ${format(date, 'p')}`; // 11 Apr 2023, 5:00 PM
};

//where ever you nsId (nextSenderId) that is used when the message container is flex-col-reverse but in case of normal flow use psId(prevSenderId) simply replace with psId and make changes to MessageCard and MessageContainer to send prevSenderId
const getMainConatainerStyle = (sId: string, lguId: string): string => {
  return sId === lguId ?
    'flex-row-reverse' :
    'flex-row gap-2';
}
const getAvatarStyle = (sId: string, lguId: string, chType: ChatType, nsId?: string): string => {
  if (chType === "one-to-one") {
    return "hidden";
  }
  else if (chType === "group") {
    if (sId === lguId || sId === nsId) {
      return "hidden";
    }
  }
  return "block";
}
const getMessageBoxStyle = (sId: string, lguId: string, chType: ChatType, nsId?: string): string => {
  const isAvatarVisible = getAvatarStyle(sId, lguId, chType, nsId) === "block";
  if (sId === lguId) {
    return sId === nsId ? "mr-2 rounded-xl" : "mr-2 rounded-xl rounded-tr-none";
    // return sId === psId ? "rounded-3xl" : "rounded-3xl rounded-tr-none";
  } else if (chType === "one-to-one") {
    // return sId === psId ? "rounded-3xl" : "rounded-3xl rounded-tl-none";
    return sId === nsId ? "ml-2 rounded-xl" : "ml-2 rounded-xl rounded-tl-none";
  }
  return isAvatarVisible ? "rounded-xl rounded-tl-none" : "rounded-xl ml-10";
}

const getTriangleStyle = (sId: string, lguId: string, nsId?: string): string => {
  if (sId === lguId) {
    return sId === nsId ? "hidden" : "-right-3";
  }
  return sId === nsId ? "hidden" : "-left-3";
}

const getNameStyle = (sId: string, lguId: string, chType: ChatType, nsId?: string): string => {
  if (sId === lguId) {
    return "hidden";
  }
  return getAvatarStyle(sId, lguId, chType, nsId);
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

const getMapFromArray = <T extends { _id: string }, U extends Record<string, T>>(arr: T[]): { map: U, orderedIds: string[] } => {
  const map: Record<string, T> = {};
  const orderedIds: string[] = [];
  arr.forEach(p => {
    map[p._id] = p;
    orderedIds.push(p._id);
  });
  return { map: map as U, orderedIds };
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

const getMediaDuration = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    const fileType = getFileType(file.type);
    if (fileType !== "video" && fileType !== "audio") {
      resolve(0);
    }
    const mediaElement = document.createElement(fileType === "video" ? "video" : "audio");
    mediaElement.preload = "metadata";

    mediaElement.onloadedmetadata = () => {
      const duration = mediaElement.duration;
      URL.revokeObjectURL(mediaElement.src);
      resolve(duration);
    }

    mediaElement.onerror = () => {
      resolve(0);
    }

    mediaElement.src = URL.createObjectURL(file);
  })
}
const getTimeString = (timeInSec: number): string => {
  const hours = Math.floor(timeInSec / 3600);
  const minutes = Math.floor((timeInSec % 3600) / 60);
  const seconds = timeInSec % 60;
  let formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  if(hours === 0){
    formattedTime = formattedTime.slice(3)
  }

  return formattedTime
}

export {
  generateFileId, getAvatarStyle,
  getDateStr,
  getDateStyle, getFileExtension, getFileType,
  getMainConatainerStyle,
  getMapFromArray,
  getMessageBoxStyle,
  getMessageTimestamp,
  getNameStyle, getTriangleStyle,
  throttle, toggleDarkMode,
  getMediaDuration,
  getSmartTimestamp,
  getTimeString
};

