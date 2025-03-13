import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import React, { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface MyInputProps {
  label?: string
  error?: string
  placeholder?: string
  type?: string
  disabled?: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  value: string
  name?: string
}
const MyInput: React.FC<MyInputProps> = ({
  label = "",
  error = "",
  placeholder = "",
  type = "text",
  disabled = false,
  onChange,
  value,
  name=""
}) => {
  const [visible, setVisible] = useState<boolean>(false);
  return (
    <div className="grid w-[100%] items-center gap-1 m-2 relative">
      {label && <Label htmlFor={label} className={`text-lg ${error ? 'text-red-500' : ''}`}>{label}</Label>}
      <Input
        type={visible ? "text" : type}
        disabled={disabled}
        onChange={onChange}
        value={value}
        id={label}
        placeholder={placeholder}
        className={`text-base border-2 ${error ? 'border-red-500' : 'border-[#525252]'} py-5`}
        name={name}
      />
      {error ? 
        <Label className='text-red-500' >{error}</Label> : 
        <p className='h-[14px]'></p>}

      {type === "password" && 
      <div
        className='absolute right-4 top-11 cursor-pointer'
      >
        {visible ? 
          <EyeOpenIcon onClick={() => setVisible(false)}/> : 
          <EyeClosedIcon onClick={() => setVisible(true)}/>
        }
      </div>}
    </div>
  )
}

export default MyInput