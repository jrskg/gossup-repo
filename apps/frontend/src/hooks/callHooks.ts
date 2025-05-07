import { CallStatus } from "@/interface/webRtcInterface";
import { useEffect, useRef } from "react";

export const useCallTimeOut = (duration: number, callStatus: CallStatus, onTimeOut: () => void) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if(timeoutRef.current){
      clearTimeout(timeoutRef.current);
    }
    if(callStatus === "calling"){
      timeoutRef.current = setTimeout(onTimeOut, duration * 1000);
    }
  }, [duration, onTimeOut, callStatus]);
}