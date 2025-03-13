import { SocketEventMap } from "@/interface/socketEvents";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export type TypedSocket = Socket<SocketEventMap, SocketEventMap>;

interface SocketContextValue {
  socket: TypedSocket | null;
  reconnectSocket: () => void
}

const SocketContext = createContext<SocketContextValue | null>(null);

interface SocketProviderProps {
  children: React.ReactNode;
}
export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<TypedSocket | null>(null);
  const isInitialized = useRef(false);

  const initializeSocket = () => {
    if (socket) socket.disconnect();
    const newSocket: TypedSocket = io("http://localhost:3000", {
      transports: ["websocket"],
    });
    setSocket(newSocket);
  };

  const reconnectSocket = () => {
    initializeSocket();
  }

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    initializeSocket();
    return () => {
      if (socket) socket.disconnect();
    }
  }, []);

  return <SocketContext.Provider value={{ reconnectSocket, socket }}>{children}</SocketContext.Provider>
}

export const useSocket = () => {
  return useContext(SocketContext)!;
}