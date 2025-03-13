import { useState } from "react";
import defaultAvatar from "../assets/defaultAvatar.jpg";
import MyButton from "./MyButton";
import { useInitialSetup } from "@/hooks/hooks";

interface ProfileSetupProps {
  handleArrow: (arrow: "left" | "right") => void;
}
const ProfileSetup: React.FC<ProfileSetupProps> = ({
  handleArrow
}) => {
  const [profile, setProfile] = useState("");
  const [imgPreview, setImgPreview] = useState<File | null>(null);
  const {updateProfilePic, loading} = useInitialSetup();

  const handleImageUpload = async () => {
    if (!profile || !imgPreview) return;
    await updateProfilePic(imgPreview);
    handleArrow("right");
  }
  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    setProfile(event.target.value);
    const file = event.target.files?.[0];
    if (file) {
      setImgPreview(file);
    }
  }
  return (
    <div className="flex flex-col w-full bg-slate-300 shadow-md justify-center items-center md:w-[50%] p-4 rounded-md dark:bg-dark-3 py-7">
      <img src={imgPreview ? URL.createObjectURL(imgPreview) : defaultAvatar} alt="" className="w-[250px] h-[250px] rounded-full" loading="lazy" />
      <div className="relative mt-1">
        <input id="profile" type="file" disabled={loading} onChange={handleImageChange} value={profile} className="hidden" />
        <label htmlFor="profile" className="px-4 py-2 inline-block rounded-md font-bold text-blue-700 cursor-pointer mt-3">
          Choose File
        </label>
      </div>
      <MyButton
          title="Save Profile"
          onClick={handleImageUpload}
          className="mt-3 w-[60%]"
          loading={loading}
        />
    </div>
  )
}

export default ProfileSetup;