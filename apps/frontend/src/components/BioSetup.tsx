import { BIO_LISTS } from "@/utils/constants";
import { useState } from "react";
import MyInput from "./MyInput";
import MyButton from "./MyButton";
import { useAppSelector, useInitialSetup } from "@/hooks/hooks";
import { toast } from "sonner";

interface BioSetupProps {
  handleArrow: (arrow: "left" | "right") => void
}

const BioSetup: React.FC<BioSetupProps> = ({
  handleArrow
}) => {
  const {user} = useAppSelector(state => state.user);
  const [bio, setBio] = useState(user?.bio || "");
  const {updateBio, loading} = useInitialSetup();
  const saveBio = async () => {
    if (!bio) return toast.error("Please write or choose a bio");
    await updateBio(bio);
    handleArrow("right");
  }
  return (
    <div className='flex flex-col bg-slate-300 shadow-md justify-center items-center md:w-[50%] p-4 rounded-md dark:bg-dark-3'>
      <MyInput
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Write a best bio"
        disabled={loading}
      />
      <div className="w-[90%] overflow-y-auto h-[300px] mb-5">
        {BIO_LISTS.map((item) => (
          <p 
            onClick={() => setBio(item)}
            className="block cursor-pointer lg:text-lg border-1 border-red-100 rounded-sm my-1 p-2 hover:bg-primary-4 ease-in-out duration-200 dark:hover:bg-dark-1" 
            key={item}
          >{item}</p>
        ))}
      </div>
      <MyButton
        title="Save Bio"
        onClick={saveBio}
        loading={loading}
      />

    </div>
  )
}

export default BioSetup