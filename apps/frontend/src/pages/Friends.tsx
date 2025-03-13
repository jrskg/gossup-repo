import FriendRequestList from "@/components/FriendRequestList";
import FriendRequestSentComp from "@/components/FriendRequestSentComp";
import FriendsList from "@/components/FriendsList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/layouts/MainLayout";
import { SearchIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Friends = () => {
  const navigate = useNavigate();
  return (
    <MainLayout>
      <div className="px-1 py-2 md:py-6 w-[100%] md:w-[95%] lg:w-[90%] m-auto">
        <Tabs defaultValue="friend-requests" className="w-[100%]">
          <TabsList className="w-[100%] text-3xl h-11">
            <TabsTrigger className="w-[33.3%] h-9 md:text-lg lg:text-xl" value="friend-requests">
              <span className="hidden md:inline mr-1">Friend</span> Requests
            </TabsTrigger>
            <TabsTrigger className="w-[33.3%] h-9 md:text-lg lg:text-xl" value="friend-list">
              Friends <span className="hidden md:inline ml-1">List</span>
            </TabsTrigger>
            <TabsTrigger className="w-[33.3%] h-9 md:text-lg lg:text-xl" value="friend-requests-sent">
              <span className="hidden md:inline mr-1">Friend Requests</span> Sent
            </TabsTrigger>
          </TabsList>
          <div className="w-[100%] flex justify-center my-2 p-2">
            <Button size={"lg"} variant={"outline"} onClick={() => navigate("/search")}>
              <SearchIcon className="mr-2 md:h-5 md:w-5 h-4 w-4" />
              <span className="text-sm md:text-lg">Find More Friends</span>
            </Button>
          </div>
          <TabsContent value="friend-requests" className="w-[100%] ">
            <FriendRequestList/>
          </TabsContent>
          <TabsContent value="friend-list" className="w-[100%] ">
            <FriendsList/>
          </TabsContent>
          <TabsContent value="friend-requests-sent" className="w-[100%] ">
            <FriendRequestSentComp/>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

export default Friends