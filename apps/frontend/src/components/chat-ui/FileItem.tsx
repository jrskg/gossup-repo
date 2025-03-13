import { FileType } from "@/interface/chatInterface";
import { cn } from "@/lib/utils";
import FileStorage from "@/utils/fileStorage";
import { DotIcon, FileText, Music, Video, X } from "lucide-react";
import React, { memo, useEffect, useState } from "react";

const storageInstance = FileStorage.getInstance();
interface FileItemProps {
  chatId: string;
  id: string;
  onRemove: (id: string) => void;
  name: string;
  size: number;
  extension?: string;
  type: FileType;
}

const FileItem: React.FC<FileItemProps> = ({
  chatId,
  id,
  name,
  onRemove,
  size,
  type,
  extension
}) => {
  const [localImgPreview, setLocalImgPreview] = useState<string | null>(null);
  console.log("FileItem rendering... " + Math.random());

  useEffect(() => {
    if (type === "image") {
      const file = storageInstance.getSingleFile(chatId, id);
      if(!file) return;
      const objectUrl = URL.createObjectURL(file);
      setLocalImgPreview(objectUrl);
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [type, chatId, id]);

  const truncateName = (fileName: string, maxLength: number) => {
    return fileName.length > maxLength ? `${fileName.slice(0, maxLength)}...` : fileName;
  };

  return (
    <div
      className={cn(`relative flex items-center justify-between bg-[#ffffff] dark:bg-gray-800 rounded-sm w-full`, type !== "image" && "px-2 pr-4 py-1"
      )}
    >
      <div className="flex w-full items-center gap-3 overflow-hidden ">
        {type === "image" ? (
          localImgPreview && (
            <img
              src={localImgPreview}
              alt={name}
              className="w-full aspect-square object-cover rounded-md "
            />
          )
        ) : (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              {type === "video" ? (
                <Video className="w-6 h-6 text-video-light dark:text-video-dark" />
              ) : type === "audio" ? (
                <Music className="w-6 h-6 text-audio-light dark:text-audio-dark" />
              ) : (
                <FileText className="w-6 h-6 text-document-light dark:text-document-dark" />
              )}
              <p
                className="font-medium  truncate max-w-[150px]"
                title={name}
              >
                {truncateName(name, 20)}
              </p>
            </div>
            <div className="px-1 flex items-center text-gray-900 dark:text-gray-300">
              <p className="text-sm ">{(size/(1024*1024)).toFixed(2)} MB</p>
              <DotIcon className="w-5 h-5" />
              {extension && <p className="text-sm">{extension}</p>}
            </div>
          </div>
        )}
      </div>
      <button
        onClick={() => onRemove(id)}
        className="absolute -top-2 -right-2 text-danger hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default memo(FileItem);
