import { getTimeString } from "@/utils/utility";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

export interface CallDurationRef{
  timeInSec: number
}

const CallDuration = forwardRef<CallDurationRef>((_, ref) => {
  const [display, setDisplay] = useState('00:00:00');
  const [counter, setCounter] = useState(0);

  useImperativeHandle(ref, () =>({ timeInSec: counter }), [counter]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setDisplay(getTimeString(counter));
  }, [counter]);

  return (
    <div className="absolute bottom-5 right-5 bg-black/50 text-white px-3 py-1 rounded-lg">
      {display}
    </div>
  );
});

export default CallDuration;