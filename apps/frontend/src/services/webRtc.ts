let peer: RTCPeerConnection | null = null;

export const createPeerConnection = (
  onTrack: (stream: MediaStream) => void,
  onIceCandidate: (candidate: RTCIceCandidate) => void
) => {
  peer = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  peer.onicecandidate = (event) => {
    if (event.candidate) {
      onIceCandidate(event.candidate);
    }
  };

  peer.ontrack = (event) => {
    onTrack(event.streams[0]);
  };

  return peer;
};

export const getLocalStream = async (type: "audio" | "video") => {
  let stream: MediaStream;
  if (type === "audio") {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
  } else {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
        facingMode: "user",
      },
    });
  }
  return stream;
};

export const getPeer = () => peer;

export const closePeerConnection = (localStream: MediaStream | null) => {
  if (peer) {
    peer.close();
    peer = null;
  }
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
  }
};
