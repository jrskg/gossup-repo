import { useSocket } from "@/context/socketContext";
import { IChat, IMessage } from "@/interface/chatInterface";
import { addToSeenMessages, transferNewToSeen } from "@/redux/slices/messages";
import { SOCKET_EVENTS } from "@/utils/constants";
import { throttle } from "@/utils/utility";
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { useAppDispatch } from "./hooks";

export const useChatBoxLogic = (selectedChat:IChat | null, userId:string, userName:string) => {
  const [userMessage, setUserMessage] = useState("");
  const dispatch = useAppDispatch();
  const {socket} = useSocket();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const emitTypingEvents = useCallback(throttle(()=> {
    if(!socket || !selectedChat) return;
    const roomId = selectedChat._id;
    socket.emit(SOCKET_EVENTS.USER_TYPING, {name: userName, userId, roomId});
  }, 2000), [socket, selectedChat, userName, userId]);

  useEffect(() => {
    setUserMessage("");
  }, [selectedChat, setUserMessage]);
  
  const handleInputMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserMessage(e.target.value);
    emitTypingEvents();
    if(typingTimeoutRef.current){
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      if(!socket || !selectedChat) return;
      const roomId = selectedChat._id;
      socket.emit(SOCKET_EVENTS.USER_STOP_TYPING, {userId, roomId, name: userName});
    }, 2000)
  }
  
  const handleSendMessage = () => {
    const messageContent = userMessage.trim();
    if(!selectedChat || !messageContent || !socket) return;
    const roomId = selectedChat._id;
    const participants = selectedChat.participants;
    const message: IMessage = {
      _id: uuid(),
      chatId: roomId,
      senderId: userId,
      content: messageContent,
      createdAt: new Date().toISOString(),
      messageType: "text",
      attachments: [],
      deliveryStatus: "sent"
    }
    if(typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit(SOCKET_EVENTS.SEND_MESSAGE, {roomId, message, participants, senderId: userId});
    dispatch(transferNewToSeen(roomId));
    dispatch(addToSeenMessages({ chatId: roomId, message }));
    setUserMessage("");
  }

  return {
    userMessage,
    handleSendMessage,
    dispatch,
    handleInputMessageChange
  }
}