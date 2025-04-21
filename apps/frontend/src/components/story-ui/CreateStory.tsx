import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { IUploadSignature, ResponseWithData } from '@/interface/interface';
import { MyStory } from '@/interface/storyInterface';
import { cn } from '@/lib/utils';
import { appendToMyStories } from '@/redux/slices/story';
import instance from '@/utils/axiosInstance';
import { getFileType, getMediaDuration } from '@/utils/utility';
import { DialogDescription } from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import axios, { AxiosError } from "axios";
import { DotIcon, Plus, UsersIcon, XIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import MyButton from '../MyButton';
import AudioAnimation from './AudioAnimation';
import ManageStoryPrivacy from './ManageStoryPrivacy';
import { useSocket } from '@/context/socketContext';
import { SOCKET_EVENTS } from '@/utils/constants';

type TabType = "text" | "media";
type MediaStoryType = "image" | "video" | "audio";

const fontFamilies: string[] = [
  'Arial, sans-serif',
  'Helvetica, sans-serif',
  'Georgia, serif',
  'Times New Roman, serif',
  'Courier New, monospace',
  'Trebuchet MS, sans-serif',
  'Verdana, sans-serif',
  'Tahoma, sans-serif',
  'Palatino Linotype, serif',
  'Lucida Console, monospace',
  'Comic Sans MS, cursive',
  'Impact, fantasy',
  'Brush Script MT, cursive'
];


const CreateStoryModal = () => {
  const [type, setType] = useState<TabType>('text');
  const [durationInSec, setDurationInSec] = useState(15); //default for text and image story

  const [selectedFileType, setSelectedFileType] = useState<MediaStoryType | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [previewObjectUrl, setPreviewObjectUrl] = useState('');

  const [text, setText] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#3e85bb');
  const [textColor, setTextColor] = useState('#000000');
  const [selectedFont, setSelectedFont] = useState(fontFamilies[0]);

  const [isDragOver, setIsDragOver] = useState(false);
  const [isMediaPaused, setIsMediaPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const dispatch = useAppDispatch();
  const {storyPrivacy} = useAppSelector(state => state.privacy);

  const {socket} = useSocket();

  const generateRandomColor = (): string => {
    const r = Math.floor(Math.random() * 256); // 0-255
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    const toHex = (value: number) => value.toString(16).padStart(2, '0');

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const getRandomFontFamily = () => {
    return fontFamilies[Math.floor(Math.random() * fontFamilies.length)];
  }
  const handleGenerateRandomStyle = () => {
    setBackgroundColor(generateRandomColor());
    setTextColor(generateRandomColor());
    setSelectedFont(getRandomFontFamily());
  };

  const resetState = (currentTab?: TabType) => {
    switch (currentTab) {
      case "media":
        setSelectedFileType(null);
        setSelectedFile(null);
        setCaption("");
        setPreviewObjectUrl("");
        break;
      case "text":
        setText("");
        setBackgroundColor("#3e85bb");
        setTextColor("#000000");
        setSelectedFont(fontFamilies[0]);
        setIsDragOver(false);
        break;
      default:
        setText("");
        setBackgroundColor("#3e85bb");
        setTextColor("#000000");
        setSelectedFont(fontFamilies[0]);
        setSelectedFileType(null);
        setSelectedFile(null);
        setCaption("");
        setPreviewObjectUrl("");
        setDurationInSec(15);
        setType("text");
        setIsDragOver(false);
        break;
    }
  }

  const isFileValid = async (file: File): Promise<{ isValid: boolean, fileType: string, duration: number }> => {
    const fileType = getFileType(file.type);
    const returnValue = { isValid: false, fileType, duration: 15 };
    if (fileType === "other") {
      toast.error("Please select an image, audio or video file");
      return returnValue
    } else if (fileType === "audio" || fileType === "video") {
      const duration = await getMediaDuration(file);
      returnValue.duration = duration;
      if (duration > 60) {
        toast.error("Please select a file less than or euqual to 1 minute");
        return returnValue;
      }
    }
    returnValue.isValid = true;

    return returnValue;
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) {
      return;
    }
    const file = e.target.files[0]
    const { isValid, fileType, duration } = await isFileValid(file);
    if (!isValid) return;
    setSelectedFile(file);
    setSelectedFileType(fileType as MediaStoryType);
    setDurationInSec(duration);
    setPreviewObjectUrl(URL.createObjectURL(file));
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (selectedFile) return;
    const files = e.dataTransfer.files;
    if (!files && !files[0]) {
      return;
    }
    const file = files[0];
    const { isValid, fileType, duration } = await isFileValid(file);
    if (!isValid) return;
    setSelectedFile(file);
    setSelectedFileType(fileType as MediaStoryType);
    setDurationInSec(duration);
    setPreviewObjectUrl(URL.createObjectURL(file));
  };

  const handleAudioPause = () => {
    if (audioRef.current) {
      audioRef.current.paused ? audioRef.current.play() : audioRef.current.pause();
      setIsMediaPaused(prev => !prev);
    }
  }

  const handleSubmit = async () => {
    setProgress(0);
    const requestBody = {
      visibility: storyPrivacy.visibility,
      allowedUsers: storyPrivacy.allowedUsers.map(user => user._id),
      excludedUsers: storyPrivacy.excludedUsers.map(user => user._id),
      type: "text",
      content: {}
    };
    if (type === "text") {
      if (!text || !text.trim()) {
        toast.error("Please enter a story text");
        return;
      }
      requestBody.content = {
        text,
        textColor,
        textFont: selectedFont,
        backgroundColor,
        duration: durationInSec
      }
    } else {
      if (!selectedFile) {
        toast.error("Please select a file");
        return;
      }
      requestBody.type = selectedFileType!;
      try {
        setLoading(true);
        const STORY_FOLDER_NAME = "storyMedia";
        const { data } = await instance.post<ResponseWithData<IUploadSignature>>("/message/get-signature", { folderName: STORY_FOLDER_NAME });
        const { apiKey, cloudName, signature, timestamp } = data.data;

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("folder", STORY_FOLDER_NAME);

        const { data: uploadData } = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
          formData,
          {
            onUploadProgress: (progressEvent) => {
              const progress = progressEvent.total ?
                Math.round((progressEvent.loaded * 100) / progressEvent.total) :
                0;
              setProgress(progress);
            }
          }
        )
        const mediaUrl = uploadData.secure_url as string;
        requestBody.content = {
          mediaUrl,
          duration: durationInSec,
          caption
        }
      } catch (error) {
        toast.error("Failed to upload file, please try again");
        console.error(error);
        setLoading(false);
        return;
      }
    }
    try {
      setLoading(true);
      setProgress(100);
      const { data } = await instance.post<ResponseWithData<MyStory>>("/story/create", requestBody);
      dispatch(appendToMyStories(data.data));
      toast.success("Story created successfully");
      if(socket){
        socket.emit(SOCKET_EVENTS.I_CREATE_STORY, {
          story: data.data,
        })
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      }
      console.error(error);
    } finally { setLoading(false); }
  };

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          resetState();
        }
      }}
    >
      <DialogTrigger asChild>
        <div className="text-center w-min">
          <div className="w-32 h-32 rounded-full dark:bg-gray-800 bg-primary-4 flex items-center justify-center cursor-pointer hover:dark:bg-gray-700 hover:bg-primary-3 transition-colors">
            <Plus className="w-12 h-12" />
          </div>
          <p className="mt-2 text-sm">Create Story</p>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Your Story</DialogTitle>
          <VisuallyHidden>
            <DialogDescription>Stories Description</DialogDescription>
          </VisuallyHidden>
        </DialogHeader>

        <Tabs defaultValue={type} onValueChange={(v) => {
          setType(prev => {
            resetState(prev);
            return v as TabType
          })
        }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">Text Story</TabsTrigger>
            <TabsTrigger value="media">Media Story</TabsTrigger>
          </TabsList>

          <TabsContent value="text">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateRandomStyle}
                  disabled={loading}
                >
                  Randomize Style
                </Button>

                <div className="flex items-center gap-2">
                  <Label>Background:</Label>
                  <input
                    disabled={loading}
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-8 h-8 rounded"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Label>Text Color:</Label>
                  <input
                    disabled={loading}
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-8 h-8 rounded"
                  />
                </div>

                <Button
                  disabled={loading}
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedFont(getRandomFontFamily())}
                >
                  {selectedFont}
                </Button>
              </div>

              <div
                className="h-96 rounded-lg p-4 flex items-center justify-center transition-all"
                style={{ backgroundColor }}
              >
                <Textarea
                  disabled={loading}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className={cn(
                    'resize-none border-none text-xl font-medium shadow-none focus-visible:ring-0 text-center h-28',
                  )}
                  style={{ color: textColor, fontFamily: selectedFont }}
                  placeholder="Enter your story text..."
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="media">
            <div className="space-y-4 mt-4">
              {selectedFile && <div className=" flex items-center mt-1 border w-max m-auto px-4 py-1 border-gray-400 rounded-lg">
                <p>{selectedFile.name}</p>
                <DotIcon />
                {(selectedFileType === "video" || selectedFileType === "audio") && <p>{Math.round(durationInSec)} Sec</p>}
                <XIcon
                  className="w-6 h-6 cursor-pointer ml-5"
                  onClick={!loading ? () => {
                    setSelectedFile(null);
                    setDurationInSec(15);
                    setSelectedFileType(null);
                    setPreviewObjectUrl('');
                  } : undefined}
                />
              </div>}

              <div
                className={cn(
                  "relative h-96 rounded-lg border-2 border-dashed flex items-center justify-center transition-all duration-300",
                  isDragOver ? "bg-gray-600" : "bg-transparent",
                  selectedFile && "border-none",
                )}
                onClick={() => {
                  if (selectedFile || loading) return;
                  fileInputRef.current?.click();
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (selectedFile || loading) return;
                  setIsDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                }}
                onDrop={handleDrop}
              >
                {selectedFileType === null && (
                  <div className="flex flex-col items-center gap-2">
                    <p className={cn(
                      "text-sm text-muted-foreground",
                      isDragOver && "text-white"
                    )}>
                      No file selected
                    </p>
                    <Input
                      ref={fileInputRef}
                      type='file'
                      onChange={handleFileChange}
                      accept="image/*,video/*,audio/*"
                      className="hidden"
                    />
                    <p className={cn(
                      "text-sm text-muted-foreground",
                      isDragOver && "text-white"
                    )}>{
                        isDragOver ? "Drop the file here" : "Drag and drop or click to select a file"
                      }</p>
                  </div>
                )}
                {selectedFileType === 'image' && (
                  <img
                    src={previewObjectUrl}
                    alt="Preview"
                    className="max-h-full rounded-lg"
                  />
                )}

                {selectedFileType === 'video' && (
                  <video
                    src={previewObjectUrl}
                    controls
                    className="max-h-full rounded-lg"
                    playsInline
                    loop
                  />
                )}

                {selectedFileType === 'audio' && (
                  <>
                    <AudioAnimation
                      isPaused={isMediaPaused}
                      onClick={handleAudioPause}
                    />
                    <audio
                      loop
                      src={previewObjectUrl}
                      controls={false}
                      autoPlay
                      className="w-0 h-0"
                      ref={audioRef}
                    />
                  </>
                )}
              </div>

              <Textarea
                value={caption}
                disabled={loading}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption..."
                className="resize-none"
              />
            </div>
          </TabsContent>
        </Tabs>
        <div className='px-3 py-2 bg-background/95 rounded-xl border'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2.5'>
              <h3 className='font-semibold text-base text-foreground'>
                Story Visibility
              </h3>
              <span className='text-muted-foreground'>
                <DotIcon className='w-4 h-4 mx-1' />
              </span>
              <div className='flex items-center gap-1.5'>
                <UsersIcon className='w-4 h-4' />
                <span className='text-sm '>
                  {
                    storyPrivacy.visibility === "all" 
                    ? "All Friends"
                    : storyPrivacy.visibility === "only"
                    ? `Only ${storyPrivacy.allowedUsers.length} Friends`
                    : `Except ${storyPrivacy.excludedUsers.length} Friends`
                  }
                </span>
              </div>
            </div>
            <ManageStoryPrivacy 
              allowedUsers={storyPrivacy.allowedUsers}
              excludedUsers={storyPrivacy.excludedUsers}
              visibility={storyPrivacy.visibility}
            />
          </div>
        </div>
        <MyButton
          title={loading ? progress < 100 ? `${progress}% Uploading...` : "Creating..." : 'Create Story'}
          onClick={handleSubmit}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateStoryModal;