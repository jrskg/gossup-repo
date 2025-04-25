import { useAuthActions } from "@/hooks/userHooks";
import { BellIcon, CircleDashed, CircleUserIcon, LogOutIcon, MessageSquareIcon, UsersIcon } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationTab from "./NavigationTab";

const SideNavigation: React.FC = () => {
  const [tab, setTab] = useState(window.location.pathname);
  const {logout} = useAuthActions();

  const navigate = useNavigate();
  const getColor = (path: string): string => {
    return path === tab ? "text-[#f5f5f5]" : "text-[#c5c5c5]"
  }
  const handleNavigation = (tab: string) => {
    setTab(tab);
    navigate(tab);
  }
  const handleLogout = async () => {
    await logout("web");
  }
  return (
    <div className="flex md:rounded-xl items-center justify-between w-screen h-[90px] fixed bottom-0 md:top-[50%] md:transform md:-translate-y-1/2 md:left-2 md:flex-col md:w-[90px] bg-[#192531] md:h-[95%] md:py-12 dark:bg-mixed-1 z-40">
      <p className="hidden md:block font-bold text-primary-1">GOSS_UP</p>
      <div className="flex justify-around w-full items-center md:flex-col md:w-[unset]">
        <NavigationTab
          label="Chats"
          icon={<MessageSquareIcon className={getColor("/")} size={25} />}
          isActive={tab === "/"}
          onClick={() => handleNavigation("/")}
        />
        <NavigationTab
          label="Stories"
          icon={<CircleDashed className={getColor("/stories")} size={25} />}
          isActive={tab === "/stories"}
          onClick={() => handleNavigation("/stories")}
        />
        <NavigationTab
          label="Friends"
          icon={<UsersIcon className={getColor("/friends")} size={25} />}
          isActive={tab === "/friends"}
          onClick={() => handleNavigation("/friends")}
        />
        <NavigationTab
          label="Notification"
          icon={<BellIcon className={getColor("/notifications")} size={25} />}
          isActive={tab === "/notifications"}
          onClick={() => handleNavigation("/notifications")}
        />
        <NavigationTab
          label="Profile"
          icon={<CircleUserIcon className={getColor("/profile")} size={25} />}
          isActive={tab === "/profile"}
          onClick={() => handleNavigation("/profile")}
        />
      </div>
      <div className="hidden md:block">
        <NavigationTab
          label="Logout"
          icon={<LogOutIcon className="text-[#f5f5f5]" size={25} />}
          onClick={handleLogout}
        />
      </div>
    </div>
  )
}

export default SideNavigation