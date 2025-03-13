import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { FileType } from '@/interface/chatInterface';
import { defaultDataPerChat } from '@/redux/slices/selectedAttachment';
import FileStorage, { IFileData } from '@/utils/fileStorage';
import { generateFileId } from '@/utils/utility';
import { FileAudioIcon, FileTextIcon, FileVideoIcon, ImageIcon, LucideIcon, PaperclipIcon } from 'lucide-react';
import React, { useRef } from 'react';
import { toast } from 'sonner';
import MenuItem from '../MenuItem';
import PopupMenu from '../PopupMenu';

interface MenuItemData {
  type: FileType
  label: string;
  icon: LucideIcon;
  iconStyle: string;
}
const menuItemData: MenuItemData[] = [
  {
    type: "other",
    label: "Document",
    icon: FileTextIcon,
    iconStyle: "text-document-light dark:text-document-dark",
  },
  {
    type: "image",
    label: "Image",
    icon: ImageIcon,
    iconStyle: "text-image-light dark:text-image-dark",
  },
  {
    type: "video",
    label: "Video File",
    icon: FileVideoIcon,
    iconStyle: "text-video-light dark:text-video-dark",
  },
  {
    type: "audio",
    label: "Audio File",
    icon: FileAudioIcon,
    iconStyle: "text-audio-light dark:text-audio-dark",
  }
]
const MAX_FILE_COUNT = 10;
const MAX_FILE_SIZE = 20 * 1024 * 1024;

interface AddAttachmentsProps { 
  selectedChatId: string;
}
const AddAttachments: React.FC<AddAttachmentsProps> = ({selectedChatId}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    loading,
    selectedFiles,
  } = useAppSelector(state => state.selectedAttachment)[selectedChatId] || defaultDataPerChat;
  const dispatch = useAppDispatch();

  const handleMenuItemClick = (type: FileType) => {
    let accept = "";
    switch (type) {
      case "image":
        accept = "image/*";
        break;
      case "video":
        accept = "video/*";
        break;
      case "audio":
        accept = "audio/*";
        break;
      default:
        accept = "*/*";
        break;
    }
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const alreadySelectedCount = selectedFiles.length;
    if (
      alreadySelectedCount >= MAX_FILE_COUNT ||
      newFiles.length > MAX_FILE_COUNT ||
      alreadySelectedCount + newFiles.length >= MAX_FILE_COUNT
    ) {
      toast.warning(`You can only select up to ${MAX_FILE_COUNT} files.`);
      return;
    }
    let validFiles: IFileData[] = [];

    newFiles.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.warning(`${file.name} exceeds the size limit of ${MAX_FILE_SIZE} MB.`);
      } else {
        const fileId = generateFileId(file);
        validFiles.push({ id: fileId, file });
      }
    });
    FileStorage.getInstance().addFiles(selectedChatId, validFiles, dispatch);
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className='hidden'
      />
      <PopupMenu
        TriggerElement={<PaperclipIcon className='md:w-8 md:h-8 w-6 h-6 cursor-pointer' />}
        width={170}
        height={200}
        isUploading={loading}
      >
        <div className='w-full h-full p-2 flex flex-col gap-2'>
          {menuItemData.map(({ icon, iconStyle, label, type }) => <MenuItem
            key={type}
            Icon={icon}
            label={label}
            iconStyle={iconStyle}
            onClick={() => handleMenuItemClick(type)}
          />)}
        </div>
      </PopupMenu>
    </div>
  )
}

export default AddAttachments;