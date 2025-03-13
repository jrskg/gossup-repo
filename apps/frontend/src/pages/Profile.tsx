import ChangePassword from "@/components/ChangePassword";
import EditBio from "@/components/EditBio";
import EditName from "@/components/EditName";
import MyButton from "@/components/MyButton";
import ProfilePicCard from "@/components/ProfilePicCard";
import SettingCard from "@/components/SettingCard";
import UserInfoCard from "@/components/UserInfoCard";
import { useAppSelector, useSettingActions } from "@/hooks/hooks";
import { useAuthActions } from "@/hooks/userHooks";
import MainLayout from "@/layouts/MainLayout";
import {
  BellIcon,
  MailIcon,
  PaletteIcon,
  PencilIcon,
  TextIcon,
  UserRoundIcon,
  Volume2Icon
} from "lucide-react";
import { useState } from "react";
const Profile = () => {
  const { user } = useAppSelector(state => state.user);
  const [nameDialogue, setNameDialogue] = useState(false);
  const [bioDialogue, setBioDialogue] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const {loading,logout} = useAuthActions();
  const {loading:updateLoading,toggleNotification, toggleSound, toggleTheme} = useSettingActions();
  
  return (
    <MainLayout>
      <EditName isOpen={nameDialogue} setIsOpen={setNameDialogue}/>
      <EditBio isOpen={bioDialogue} setIsOpen={setBioDialogue}/>
      <ChangePassword isOpen={changePassword} setIsOpen={setChangePassword}/>
      <div className="md:my-6 w-full lg:w-[90%] m-auto flex flex-col md:flex-row justify-center">
        <div className="p-2 md:p-5 bg-slate-200 md:rounded-sm w-[100%] md:w-[60%] flex flex-col items-center space-y-2 dark:bg-dark-2">
          <ProfilePicCard
            initialImage={user!.profilePic?.image}
            editable={true}
          />
          <div>
            <UserInfoCard
              label="Name"
              value={user!.name}
              description="This name will appear to others in conversations. It won't affect your login credentials."
              leftIcon={<UserRoundIcon className="min-w-6 min-h-6" />}
              rightIcon={<PencilIcon onClick={() => setNameDialogue(true)} className="cursor-pointer min-w-6 min-h-6" />}
            />
            <UserInfoCard
              label="Email"
              value={user!.email}
              leftIcon={<MailIcon className="min-w-6 min-h-6" />}
            />
            <UserInfoCard
              label="About"
              value={user!.bio}
              leftIcon={<TextIcon className="min-w-6 min-h-6" />}
              rightIcon={<PencilIcon onClick={() => setBioDialogue(true)} className="cursor-pointer min-w-6 min-h-6" />}
            />
          </div>
        </div>
        <div className="w-[100%] md:w-[30%] bg-slate-200 mt-1 md:mt-0 md:ml-5 md:rounded-sm flex flex-col items-center p-5 space-y-10 dark:bg-dark-2">
          <h1 className="text-3xl font-bold">Settings</h1>
          <div className="flex flex-col items-center space-y-5 w-[100%]">
            <SettingCard
              icon={<PaletteIcon size={25} />}
              label="Dark Mode"
              currentValue={user!.settings.theme === "dark"}
              hasSwitch={true}
              onSwitchChange={toggleTheme}
              loading={updateLoading}
            />
            <SettingCard
              icon={<BellIcon size={25} />}
              label="Notification"
              currentValue={user!.settings.notificationEnabled}
              hasSwitch={true}
              onSwitchChange={toggleNotification}
              loading={updateLoading}
            />
            <SettingCard
              icon={<Volume2Icon size={25} />}
              label="Notification Sound"
              currentValue={user!.settings.soundEnabled}
              hasSwitch={true}
              onSwitchChange={toggleSound}
              loading={updateLoading}
            />
          </div>
          <div className="flex flex-col items-center space-y-4 w-[100%]">
            <MyButton
              title="Change Password"
              onClick={() => setChangePassword(true)}
            />
            <MyButton
              title="Logout"
              onClick={async() => await logout("web")}
              btnClassName="bg-red-500 hover:bg-red-600"
              loading={loading}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default Profile