import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

interface Props {
  initialX?: number;
  initialY?: number;
  children?: React.ReactNode;
  className?: string;
}

const DraggableBox: React.FC<Props> = ({
  children,
  initialX = 0,
  initialY = 0,
  className
}) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  });

  return (
    <div
      ref={boxRef}
      onMouseDown={handleMouseDown}
      style={{
        top: position.y,
        left: position.x,
        transform: isDragging ? "scale(1.07)" : "scale(1)",
        transition: isDragging
          ? "none"
          : "top 0.15s ease, left 0.15s ease, transform 0.2s ease",
      }}
      className={cn(
        "fixed w-64 h-64 bg-transparent rounded-full shadow-xl cursor-grab active:cursor-grabbing z-[100]",
        className
      )}
    >
      {children}
    </div>
  );
};

export default DraggableBox;
