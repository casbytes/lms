import React from "react";
import Iframe from "react-iframe";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { cn } from "~/libs/shadcn";

type IframeProps = {
  videoId: string;
  className?: string;
  videoSource: string;
};

export function IFrame({ videoId, videoSource, className }: IframeProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const handleLoad = () => setIsLoading(false);

  return (
    <div className={cn("relative pt-[56.25%]", className)}>
      <Iframe
        id="iframe"
        loading="lazy"
        url={`${videoSource}/${videoId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`}
        className={cn(
          "border-0 absolute top-0 h-full w-full rounded-md",
          isLoading ? "hidden" : "block"
        )}
        allow="accelerometer;gyroscope;encrypted-media;picture-in-picture;"
        allowFullScreen
        onLoad={handleLoad}
      />
      {isLoading ? (
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="bg-black/50 bg-opacity-90 flex items-center justify-center h-full rounded-md">
            <AiOutlineLoading3Quarters
              size={50}
              className="text-sky-300 animate-spin"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export const VideoIframe = React.memo(IFrame);
