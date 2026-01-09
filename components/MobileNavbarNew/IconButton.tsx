/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";

interface IconButtonProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

export const IconButton: React.FC<IconButtonProps> = ({
  src,
  alt,
  className,
  onClick,
}) => {
  return (
    <button
      className={className}
      onClick={onClick}
      type="button"
      aria-label={alt}
    >
      <img src={src} alt={alt} width={34} height={34} />
    </button>
  );
};
