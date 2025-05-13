import CallLog from "@/components/call-ui/CallLog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MainLayout from "@/layouts/MainLayout"

const Notifications = () => {
  return (
    <MainLayout>
      <div className="px-1 py-2 md:py-6 w-[100%] md:w-[80%] lg:w-[50%] m-auto">
        <Tabs defaultValue="notification-tab" className="w-full">
          <TabsList className="w-full h-10">
            <TabsTrigger 
              value="notification-tab"
              className="w-[50%] h-9 md:text-sm lg:text-lg"
            >Notifications</TabsTrigger>
            <TabsTrigger 
              value="call-tab"
              className="w-[50%] h-9 md:text-sm lg:text-lg"
            >Call Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="notification-tab" className="w-full">
            <div className="w-full h-[40vh] flex justify-center items-center">
              <h1 className="text-3xl text-gray-900 dark:text-gray-200">Will implement this later.</h1>
            </div>
          </TabsContent>
          <TabsContent value="call-tab" className="w-full">
            <CallLog/>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

export default Notifications