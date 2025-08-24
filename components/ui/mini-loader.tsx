import React from "react";

interface MiniLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const MiniLoader: React.FC<MiniLoaderProps> = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <img
      src="/UI/dino-loader.gif"
      alt="Loading..."
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};

export default MiniLoader;
