import React from "react"

interface NavigationTabProps {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  isActive?: boolean
}

const NavigationTab:React.FC<NavigationTabProps> = ({
  icon,
  label,
  onClick = () => {},
  isActive = false
}) => {
  return (
    <div 
      className={`${isActive ? "bg-[#8d8d8d91]" : "bg-transparent"} min-w-[70px] h-[70px] flex flex-col justify-center items-center rounded-lg cursor-pointer md:my-2 hover:bg-[#8d8d8d91] transition duration-300`}
      onClick={onClick}
    >
      {icon}
      <p className={`text-sm ${isActive ? "text-[#fff] font-bold" : "text-[#919191]"} text-center mt-1`}>{label}</p>
    </div>
  )
}

export default NavigationTab