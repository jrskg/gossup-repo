import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { getFileType, getMediaDuration } from '@/utils/utility';
import { DotIcon, Plus, XIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import MyButton from '../MyButton';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { DialogDescription } from '@radix-ui/react-dialog';
import AudioAnimation from './AudioAnimation';

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
  const [textColor, setTextColor] = useState('#000');
  const [selectedFont, setSelectedFont] = useState(fontFamilies[0]);

  const [isDragOver, setIsDragOver] = useState(false);
  const [isMediaPaused, setIsMediaPaused] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    const formData = new FormData();

    if (type === 'text') {
      formData.append('type', 'text');
      formData.append('content', JSON.stringify({
        text,
        backgroundColor,
        textColor,
        font: selectedFont
      }));
    } else {
      if (!selectedFile) return;
      formData.append('type', type);
      formData.append('file', selectedFile);
      formData.append('caption', caption);
    }

    // Add your API call here
    console.log('Submitting:', Object.fromEntries(formData));
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
                >
                  Randomize Style
                </Button>

                <div className="flex items-center gap-2">
                  <Label>Background:</Label>
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-8 h-8 rounded"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Label>Text Color:</Label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-8 h-8 rounded"
                  />
                </div>

                <Button
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
                  onClick={() => {
                    setSelectedFile(null);
                    setDurationInSec(15);
                    setSelectedFileType(null);
                    setPreviewObjectUrl('');
                  }}
                />
              </div>}

              <div
                className={cn(
                  "relative h-96 rounded-lg border-2 border-dashed flex items-center justify-center transition-all duration-300",
                  isDragOver ? "bg-gray-600" : "bg-transparent",
                  selectedFile && "border-none",
                )}
                onClick={() => {
                  if (selectedFile) return;
                  fileInputRef.current?.click();
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (selectedFile) return;
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
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption..."
                className="resize-none"
              />
            </div>
          </TabsContent>
        </Tabs>

        <MyButton
          title='Create Story'
          onClick={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateStoryModal;