import { useSocket } from '@/context/socketContext';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import type { IAttachment, IChat, IMessage } from '@/interface/chatInterface';
import { cn } from '@/lib/utils';
import { addToSeenMessages, transferNewToSeen } from '@/redux/slices/messages';
import { defaultDataPerChat, IFileMetaData, uploadSelectedAttachments } from '@/redux/slices/selectedAttachment';
import { SOCKET_EVENTS } from '@/utils/constants';
import FileStorage from '@/utils/fileStorage';
import React, { memo, useCallback } from 'react';
import { toast } from 'sonner';
import { v4 as uuid } from "uuid";
import MyButton from '../MyButton';
import ProgressBar from '../ProgressBar';
import FileItem from './FileItem';

const fileStorage = FileStorage.getInstance();

type SegregatedFilesType = Record<"images" | "otherFiles", IFileMetaData[]>
interface SendAttachmentsProps {
  selectedChat: IChat;
  userId: string
}

const SendAttachments: React.FC<SendAttachmentsProps> = ({ selectedChat, userId }) => {
  const filesDataPerChat = useAppSelector(state => state.selectedAttachment)[selectedChat._id] || defaultDataPerChat;
  const {
    error,
    selectedFiles,
    uploadProgress,
    loading
  } = filesDataPerChat;
  const dispatch = useAppDispatch();

  const { socket } = useSocket();

  const segregatedFiles: SegregatedFilesType = (() => {
    const images: IFileMetaData[] = [];
    const otherFiles: IFileMetaData[] = [];
    selectedFiles.forEach(file => {
      if (file.type === "image") images.push(file);
      else otherFiles.push(file);
    });
    return { images, otherFiles };
  })();

  const sendMessageAsAttachment = (attachments: IAttachment[]) => {
    if (!socket) {
      toast.error("Something went wrong, please try again later.");
      return;
    }
    const roomId = selectedChat._id;
    const participants = selectedChat.participants;
    const message: IMessage = {
      _id: uuid(),
      chatId: roomId,
      senderId: userId,
      content: "",
      createdAt: new Date().toISOString(),
      messageType: "file",
      attachments,
      deliveryStatus: "sent",
    }
    socket.emit(SOCKET_EVENTS.SEND_MESSAGE, { roomId, message, participants, senderId: userId });
    dispatch(transferNewToSeen(roomId));
    dispatch(addToSeenMessages({ chatId: roomId, message }));
  }

  const handleSendFiles = () => {
    dispatch(uploadSelectedAttachments({ chatId: selectedChat._id, onUploadSucess: sendMessageAsAttachment }))
  }

  const removeFile = useCallback(
    (id: string) => {
      fileStorage.removeFile(selectedChat._id, id, dispatch);
    },
    [dispatch, selectedChat]
  );

  if (selectedFiles.length === 0) return null;
  return (
    <div className="z-50 absolute bottom-24 w-[100%] max-h-[400px] flex justify-center">
      <div className='w-[98%] lg:w-[90%] pb-3 bg-[#eeeeee] dark:bg-dark-3 rounded-lg flex flex-col'>
        <div className="flex flex-col overflow-y-auto">
          {
            Object.entries(segregatedFiles).map(([type, files]) => (
              files.length > 0 && <div
                key={type}
                className={cn(
                  "grid w-full gap-2 auto-rows-min p-3",
                  type === "images" ?
                    "grid-cols-[repeat(auto-fill,minmax(100px,1fr))]" :
                    "grid-cols-[repeat(auto-fill,minmax(150px,1fr))]"
                )}
              >
                {files.map((file) => <FileItem
                  chatId={selectedChat._id}
                  key={file.id}
                  id={file.id}
                  onRemove={removeFile}
                  name={file.name}
                  size={file.size}
                  extension={file.extension}
                  type={file.type}
                />)}
              </div>
            ))
          }
        </div>
        <div className="h-20 p-4 border-t-2 rounded-b-lg border-primary-1 bg-[#eeeeee] dark:bg-dark-3 flex items-center justify-center">
          {error ? (
            <div className="w-full flex flex-col items-center gap-1">
              <p className="text-danger dark:text-[#f53d5c] text-lg font-medium">{"this is an error"}</p>
              <MyButton
                className="w-[40%]"
                btnClassName="dark:bg-red-500 dark:hover:bg-red-600"
                title="Retry"
                onClick={handleSendFiles}
              />
            </div>
          ) : loading ? (
            <ProgressBar progress={uploadProgress} />
          ) : (
            <MyButton
              className="w-[60%]"
              btnClassName="dark:bg-dark-4 dark:hover:bg-dark-5"
              title="Send"
              onClick={handleSendFiles}
            />
          )}

        </div>
      </div>
    </div>
  )
}

export default memo(SendAttachments);