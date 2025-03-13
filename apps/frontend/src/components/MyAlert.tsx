import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import MyButton from "./MyButton";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface Props {
  alertTriggerComponent: React.ReactNode;
  title: string;
  description: string;
  cancelHandler?: () => void;
  okHandler?: () => void | Promise<void>;
  cancelText?: string;
  okText?: string;
  loading?: boolean;
  okBtnClassName?: string;
  cancelBtnClassName?: string;
}
export const MyAlert: React.FC<Props> = ({
  alertTriggerComponent,
  title,
  description,
  cancelHandler,
  okHandler,
  cancelText = "Cancel",
  okText = "OK",
  loading = false,
  okBtnClassName = "",
  cancelBtnClassName = ""
}) => {
  const [open, setOpen] = useState(false);
  const isAsync = (func: () => void | Promise<void>) => {
    return func.constructor.name === "AsyncFunction";
  }
  const handleOkClick = async() => {
    if (okHandler) {
      if(isAsync(okHandler)) {
        await okHandler();
      }else {
        okHandler();
      }
    }
    setOpen(false);
  }
  return (
    <AlertDialog open={open} onOpenChange={(val) => {
      if(loading){
        toast.warning("Wait a second...");
        return;
      }
      setOpen(val);
    }}>
      <AlertDialogTrigger asChild>
        {alertTriggerComponent}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant={"outline"}
            className={cn(cancelBtnClassName)}
            onClick={cancelHandler ? cancelHandler : () => setOpen(false)}
            disabled={loading}
          >{cancelText}</Button>
          <MyButton
            title={okText}
            onClick={handleOkClick}
            className="w-[unset]"
            loading={loading}
            btnClassName={okBtnClassName}
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
