import { Image, IUserShort } from '@/interface/interface'
import { VisibilityType } from '@/interface/storyInterface'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { X } from 'lucide-react'; // Import an icon for removal
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import defaultAvatar from "../../assets/defaultAvatar.jpg"
import FriendSelector from '../chat-ui/FriendSelector'
import MyButton from '../MyButton'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { ScrollArea } from '../ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import instance from '@/utils/axiosInstance';
import { toast } from 'sonner';
import { useAppDispatch } from '@/hooks/hooks';
import { setStoryPrivacy } from '@/redux/slices/privacy';
import { AxiosError } from 'axios';

interface Props {
  allowedUsers: IUserShort[];
  excludedUsers: IUserShort[];
  visibility: VisibilityType;
}
const ManageStoryPrivacy: React.FC<Props> = ({
  allowedUsers,
  excludedUsers,
  visibility
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [visibilityLocal, setVisibilityLocal] = useState<VisibilityType>("all")
  const [allowedUsersLocal, setAllowedUsersLocal] = useState<IUserShort[]>([]);
  const [excludedUsersLocal, setExcludedUsersLocal] = useState<IUserShort[]>([]);
  const [loading, setLoading] = useState(false);

  const updateSelectedFriendRef = useRef<(id: string, name: string, avatar: string) => void>(() => { });
  const dispatch = useAppDispatch();

  useEffect(() => {
    setAllowedUsersLocal(allowedUsers);
    setExcludedUsersLocal(excludedUsers);
    setVisibilityLocal(visibility)
  }, [allowedUsers, excludedUsers, visibility]);

  updateSelectedFriendRef.current = (id: string, name: string, avatar: string) => {
    if (visibilityLocal === "only") {
      setAllowedUsersLocal((prev) => {
        const isAlreadySelected = prev.some(user => user._id === id);
        const profilePic: Image = { avatar, image: "", publicId: "" };
        if (isAlreadySelected) {
          return prev.filter(user => user._id !== id);
        } else {
          return [...prev, { _id: id, name, profilePic }];
        }
      });
    }
    else if (visibilityLocal === "except") {
      setExcludedUsersLocal((prev) => {
        const isAlreadySelected = prev.some(user => user._id === id);
        const profilePic: Image = { avatar, image: "", publicId: "" };
        if (isAlreadySelected) {
          return prev.filter(user => user._id !== id);
        } else {
          return [...prev, { _id: id, name, profilePic }];
        }
      });
    }
  }
  const handleFriendClick = useCallback((id: string, name: string, avatar: string) => {
    updateSelectedFriendRef.current(id, name, avatar);
  }, []);

  const handleChipRemove = useCallback((id: string) => {
    if (visibilityLocal === "only") {
      setAllowedUsersLocal((prev) => prev.filter(user => user._id !== id));
    }
    else if (visibilityLocal === "except") {
      setExcludedUsersLocal((prev) => prev.filter(user => user._id !== id));
    }
  }, [visibilityLocal, setAllowedUsersLocal, setExcludedUsersLocal]);

  const handleSaveStoryPrivacy = async() => {
    try {
      setLoading(true);
      const {data} = await instance.put("/privacy/story", {
        visibility: visibilityLocal,
        allowedUsers: allowedUsersLocal.map(user => user._id),
        excludedUsers: excludedUsersLocal.map(user => user._id)
      });
      if (data.success) {
        toast.success("Story visibility updated successfully");
        dispatch(setStoryPrivacy({
          allowedUsers: allowedUsersLocal,
          excludedUsers: excludedUsersLocal,
          visibility: visibilityLocal
        }));
        handleClose();
      }
    } catch (error) {
      if(error instanceof AxiosError && error.response){
        toast.error(error.response.data.message);
        console.log(error);
      }
    } finally{
      setLoading(false);
    }
  }
  
  const handleClose = () => {
    setIsOpen(prev => {
      if (prev) {
        setAllowedUsersLocal(allowedUsers);
        setExcludedUsersLocal(excludedUsers);
        setVisibilityLocal(visibility);
      }
      return false;
    });
  }

  return (
    <Dialog 
      open={isOpen}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          onClick={() => setIsOpen(true)}
        >Manage Story Privacy</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md md:max-w-lg [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Control Story Visibility</DialogTitle>
          <VisuallyHidden>
            <DialogDescription></DialogDescription>
          </VisuallyHidden>
        </DialogHeader>

        <Tabs defaultValue={visibilityLocal} onValueChange={v => setVisibilityLocal(v as VisibilityType)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Friends</TabsTrigger>
            <TabsTrigger value="only">Only</TabsTrigger>
            <TabsTrigger value="except">Except</TabsTrigger>
          </TabsList>

          <TabsContent value='all' className="mt-4">
            <div className="w-full text-center py-6">
              <span className="text-muted-foreground">All friends can view your story</span>
            </div>
          </TabsContent>

          {['only', 'except'].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-4">
              {/* Selected users panel */}
              <div className="border rounded-lg p-2">
                <h4 className="text-sm font-medium mb-2">
                  {tab === 'only' ? 'Included friends' : 'Excluded friends'}
                </h4>
                <ScrollArea className="h-24">
                  <div className="flex flex-wrap gap-2">
                    {(tab === 'only' ? allowedUsersLocal : excludedUsersLocal).map((user) => (
                      <UserChipComponent
                        key={user._id}
                        name={user.name} // Replace with actual name retrieval logic
                        friendId={user._id}
                        handleRemove={handleChipRemove}
                        avatar={user.profilePic?.avatar}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          ))}
        </Tabs>
        {visibilityLocal != "all" &&<div className="min-h-[400px] max-h-[65vh] h-[50vh]">
          <FriendSelector
            onFriendClick={handleFriendClick}
          />
        </div>}
        <div className="flex justify-between gap-2">
          <Button
            variant={"outline"}
            onClick={handleClose}
            className='w-[50%]'
            disabled={loading}
          >
            Close
          </Button>
          <MyButton
            onClick={handleSaveStoryPrivacy}
            title='Save Changes'
            className='w-[50%]'
            loading={loading}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ManageStoryPrivacy;


interface UserChipComponentProps {
  friendId: string;
  handleRemove: (friendId: string) => void;
  name: string;
  avatar?: string;
}
const UserChipComponent: React.FC<UserChipComponentProps> = memo(({
  friendId,
  handleRemove,
  name,
  avatar
}) => {
  return (
    <div
      className="flex items-center gap-2 px-2 py-1 bg-accent rounded-full text-sm"
    >
      <Avatar className="w-6 h-6">
        <AvatarImage src={avatar ? avatar : defaultAvatar} />
        <AvatarFallback>F</AvatarFallback>
      </Avatar>
      <span>{name}</span>
      <X
        className="w-4 h-4 cursor-pointer text-muted-foreground hover:text-foreground"
        onClick={() => handleRemove(friendId)}
      />
    </div>
  )
})