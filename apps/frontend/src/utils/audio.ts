type AudioCache = {
  [src: string]: HTMLAudioElement;
}

const audioCache: AudioCache = {};

export function playSound(src: string) {
  if(!audioCache[src]) {
    const audio = new Audio(src);
    audio.preload = "auto";
    audioCache[src] = audio;
  }
  
  const audio = audioCache[src]
  audio.currentTime = 0;
  audio.play().catch(() => { console.log("Failed to play sound") });
}