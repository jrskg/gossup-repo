import { useInitialSetup } from "@/hooks/hooks";
import { CameraIcon } from "lucide-react";
import React, { useRef, useState } from "react";
import defaultAvatar from "../assets/defaultAvatar.jpg";
import Spinner from "./Spinner";
import { Button } from "./ui/button";

interface ProfilePicCardProps {
  initialImage?: string;
  editable?: boolean;
}

const ProfilePicCard: React.FC<ProfilePicCardProps> = ({
  initialImage,
  editable = false,
}) => {
  const [selectedImg, setSelectedImg] = useState<File | null>(null);
  const [img, setImg] = useState("");
  const inputRef = useRef<null | HTMLInputElement>(null);
  const {updateProfilePic, loading} = useInitialSetup();

  const getImgSource = () => {
    if (selectedImg) {
      return URL.createObjectURL(selectedImg);
    } else if (initialImage) {
      return initialImage;
    } else {
      return defaultAvatar;
    }
  }
  const handleImgChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImg(event.target.value);
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImg(file);
    }
  }

  const handleSaveImage = async() => {
    if(selectedImg) await updateProfilePic(selectedImg, () => {
      setSelectedImg(null);
      setImg("");
    })
  }

  return (
    <div className="relative flex flex-col items-center justify-center mb-10">
      {loading &&
        <Spinner className="absolute" />}
      <img
        src={getImgSource()}
        alt="Your Profile"
        loading="lazy"
        className={`w-[200px] h-[200px] md:w-[300px] md:h-[300px] rounded-full ${loading ? "blur" : "blur-0"} transition-all duration-300`}
      />
      {editable && <CameraIcon
        onClick={() => !loading && inputRef.current?.click()}
        size={45}
        className="bg-primary-1 text-dark-1 p-2 rounded-full absolute md:bottom-4 md:right-9 bottom-3 right-3 cursor-pointer"
      />}
      <input type="file" value={img} onChange={handleImgChange} ref={inputRef} className="hidden" />
      {selectedImg &&
        <Button
          size={"lg"}
          variant={"ghost"}
          className="absolute bottom-[-50px] left-[50%] translate-x-[-50%] font-bold"
          onClick={handleSaveImage}
          disabled={loading}
        >Save</Button>
      }
    </div>
  );
};

export default ProfilePicCard;
