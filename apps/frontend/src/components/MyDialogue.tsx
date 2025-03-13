import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Dispatch, SetStateAction } from "react"
import {toast} from "sonner"

interface MyDialogProps {
  children: React.ReactNode
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  header?:string
  description?:string
  footer?:React.ReactNode
  dissmissable?:boolean
  onDismiss?: () => void
}

const MyDialog: React.FC<MyDialogProps> = ({
  children,
  isOpen,
  setIsOpen,
  header="",
  description="",
  footer,
  dissmissable=true,
  onDismiss = () => {}
}) => {
  const handleClose = (open: boolean) => {
    if(!dissmissable){
      toast.warning("Wait a second...")
      return;
    }
    setIsOpen(open);
    onDismiss();
  }
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#eeeeee] dark:bg-dark-1" >
        <DialogHeader>
          <DialogTitle>{header}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter>
          {footer && footer} 
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default MyDialog