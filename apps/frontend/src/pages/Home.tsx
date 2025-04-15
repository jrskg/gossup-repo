import ChatBox from "@/components/chat-ui/ChatBox";
import ChatDetails from "@/components/chat-ui/ChatDetails";
import ChatList from "@/components/chat-ui/ChatList";
import { 
  ChatsContext, 
  LoggedInUserContext, 
  MessagesContext, 
  ParticipantsContext, 
  SelectedChatContext 
} from "@/context/contexts";
import { useAppDispatch } from "@/hooks/hooks";
import type { ChatMap, IChat, ParticipantsMap } from "@/interface/chatInterface";
import type { IUser, ResponseWithData } from "@/interface/interface";
import { UserPrivacy } from "@/interface/storyInterface";
import MainLayout from "@/layouts/MainLayout";
import { Messages } from "@/redux/slices/messages";
import { setStoryPrivacy } from "@/redux/slices/privacy";
import instance from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface HomeProps {
  user:IUser | null;
  isDetailsOn:boolean;
  selectedChat:IChat | null;
  chatMap:ChatMap;
  orderedChatIds:string[];
  participants:ParticipantsMap;
  messages:Messages
}
const Home:React.FC<HomeProps> = ({
  chatMap,
  orderedChatIds,
  isDetailsOn,
  messages,
  participants,
  selectedChat,
  user
}) => {
  
  const [screenSize, setScreenSize] = useState<string>("large");
  const dispatch = useAppDispatch();

  useEffect(() => {
    (async()=>{
      try {
        const {data} = await instance.get<ResponseWithData<UserPrivacy>>("/privacy");
        dispatch(setStoryPrivacy(data.data.storyPrivacy));
      } catch (error) {
        if(error instanceof AxiosError && error.response){
          toast.error(error.response.data.message);
        }
        console.log(error);
      }
    })()
  }, []);

  useEffect(() => {
    const updateScreenSize = () => {
      if (window.innerWidth < 768) setScreenSize("small");
      else if (window.innerWidth < 1280) setScreenSize("medium");
      else setScreenSize("large");
    };

    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);

    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  console.log("Home rendering...", Math.random());

  return (
    <MainLayout>
      <LoggedInUserContext.Provider value={user}>
        <SelectedChatContext.Provider value={selectedChat}>
          <ChatsContext.Provider value={{chatMap, orderedChatIds}}>
            <MessagesContext.Provider value={messages}>
              <ParticipantsContext.Provider value={participants}>
                <div className="w-full md:mt-6 h-[calc(100vh-90px)] md:h-[94vh] flex justify-center">
                  {!(screenSize === "medium" || screenSize === "large") && <ChatList
                    className={(screenSize === "small" && selectedChat) ? "hidden" : ""}
                  />}

                  {screenSize === "small" && selectedChat && (
                    isDetailsOn ? (
                      <ChatDetails
                        className="w-full"
                      />
                    ) : (
                      <ChatBox
                        className="w-full"
                      />
                    )
                  )}

                  {screenSize === "medium" && (
                    <div className="grid w-[95%] h-full grid-flow-col grid-cols-[1fr_1fr]">
                      <ChatList />
                      {isDetailsOn ? (
                        <ChatDetails
                          className="md:rounded-tl-none md:rounded-bl-none border-l dark:border-primary-1"
                        />
                      ) : (
                        <ChatBox />
                      )}
                    </div>
                  )}

                  {screenSize === "large" && (
                    <div className="grid w-[95%] h-full grid-flow-col grid-cols-[1fr_2fr]">
                      <ChatList />
                      <div className="flex w-full h-full gap-1">
                        <ChatBox
                          className={isDetailsOn ? "w-[55%]" : "w-[100%]"}
                        />
                        {isDetailsOn && (
                          <ChatDetails
                            className="w-[45%]"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </ParticipantsContext.Provider>
            </MessagesContext.Provider>
          </ChatsContext.Provider>
        </SelectedChatContext.Provider>
      </LoggedInUserContext.Provider>
    </MainLayout>
  );
};

export default Home;
