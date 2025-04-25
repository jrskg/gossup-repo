import { useEffect, useRef, useState } from 'react';
import defaultAvatar from "../../assets/defaultAvatar.jpg";
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';

interface Props{
  stream: MediaStream | null;
  userIcon?: string;
  className?: string;
}

const AudioWave: React.FC<Props> = ({ stream, userIcon, className }) => {
  // console.log('AudioWave component rendered');
  const [volume, setVolume] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (!stream) return;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 32;

    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;

    let animationId: number;
    let lastUpdate = Date.now();

    const update = () => {
      if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const vol = Math.max(...dataArrayRef.current) / 255;
        if (Date.now() - lastUpdate > 100) {
          setVolume(vol);
          lastUpdate = Date.now();
        }
      }
      animationId = requestAnimationFrame(update);
    };

    update();

    return () => {
      cancelAnimationFrame(animationId);
      audioContext.close();
    };
  }, [stream]);

  // const isSpeaking = false;
  const isSpeaking = volume > 0.05;

  const delayValues = [0, 0.05, 0.1, 0.15];


  return (
    <div className={cn("relative w-40 h-40", className)}>
      {isSpeaking ? delayValues.map((delay, index) => (
        <div
          key={index}
          className="absolute w-full animate-ping h-full border-4 border-primary-1 rounded-full"
          style={{ animationDelay: `${delay}s` }}
        />
      )) :
        <div
          className="absolute w-full animate-pulse h-full border-8 border-primary-1 rounded-full"
        />
      }
      <div className='w-full h-full animate-pulse rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center'>
        <Avatar className="w-full h-full select-none pointer-events-none">
          <AvatarImage className='object-cover' src={userIcon ? userIcon : defaultAvatar} alt="user" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default AudioWave;