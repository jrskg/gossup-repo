import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

export interface CallDurationRef{
  display: string
}

const CallDuration = forwardRef<CallDurationRef>((_, ref) => {
  const [display, setDisplay] = useState('00:00:00');
  const [counter, setCounter] = useState(0);

  useImperativeHandle(ref, () =>({ display }), [display]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const hours = Math.floor(counter / 3600);
    const minutes = Math.floor((counter % 3600) / 60);
    const seconds = counter % 60;
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    setDisplay(formattedTime);
  }, [counter]);


  return (
    <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-lg">
      {display}
    </div>
  );
});

export default CallDuration;