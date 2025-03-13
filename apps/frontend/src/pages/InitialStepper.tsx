import BioSetup from "@/components/BioSetup";
import NotifPermissionStep from "@/components/NotifPermissionStep";
import ProfileSetup from "@/components/ProfileSetup"
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react"

const InitialStepper = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const getArrowNames = (): { left: string, right: string } => {
    const names = {
      left: "",
      right: ""
    }
    switch (currentStep) {
      case 1:
        names.left = ""
        names.right = "Setup Bio"
        break;
      case 2:
        names.left = "Setup Profile"
        names.right = "Setup Notification"
        break;
      case 3:
        names.right = ""
        names.left = "Setup Bio"
        break;
    }
    return names
  }
  const getHeading = (): string => {
    let heading = "";
    if (currentStep === 1) heading = "Choose a profile picture helps others recognize you";
    else if (currentStep === 2) heading = "Write a bio that describes you";
    else if (currentStep === 3) heading = "Give permission to send notifications";
    return heading;
  }
  const handleArrow = (arrow: "left" | "right") => {
    if (arrow === "left") setCurrentStep(currentStep - 1)
    if (arrow === "right") setCurrentStep(currentStep + 1)
  }
  return (
    <div className="w-full m-auto p-10 my-4 flex flex-col items-center space-y-10 lg:w-[90%]" >
      <h1 className="text-3xl font-bold text-center">{getHeading()}</h1>
      <div className="w-full flex flex-col items-center min-h-[350px]">
        {currentStep === 1 && <ProfileSetup handleArrow={handleArrow} />}
        {currentStep === 2 && <BioSetup handleArrow={handleArrow} />}
        {currentStep === 3 && <NotifPermissionStep />}
      </div>

      <div className="w-[100%] lg:w-[60%] relative">
        {currentStep > 1 && <Button onClick={() => handleArrow("left")} variant={"outline"} className="absolute top-0 left-0" size={"lg"}>
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{getArrowNames().left}</span>
        </Button>}
        {currentStep < 3 && <Button onClick={() => handleArrow("right")} variant={"outline"} size={"lg"} className="absolute top-0 right-0">
          <span className="hidden sm:inline">{getArrowNames().right}</span>
          <ChevronRight className="h-4 w-4" />
        </Button>}
      </div>
    </div>
  )
}

export default InitialStepper