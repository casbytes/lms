import React from "react";
import { cn } from "~/libs/shadcn";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
  src: string;
  alt: string;
  width?: number;
  height?: number;
  srcSet?: string;
  sizes?: string;
  cdn?: boolean;
}

export function Image({
  src,
  alt,
  cdn = true,
  srcSet,
  sizes,
  width,
  height,
  className,
  ...props
}: ImageProps) {
  const finalSrc = cdn ? `${ENV.CDN_URL}/${src}` : src;
  return (
    <img
      src={finalSrc}
      alt={alt}
      sizes={sizes}
      srcSet={srcSet}
      loading="lazy"
      height={height}
      width={width}
      className={cn("max-w-full h-auto", className)}
      {...props}
    />
  );
}
