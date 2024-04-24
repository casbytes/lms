import React from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { cn } from "~/libs/shadcn";

type IframeProps = {
  videoId: string;
  className?: string;
};

export function IFrame({ videoId, className }: IframeProps) {
  const [loaded, setLoaded] = React.useState(false);

  function handleLoad() {
    setLoaded(true);
  }
  return (
    <div className={cn("relative pt-[56.25%]", className)}>
      <iframe
        src={`${process.env.BUNNY_IFRAME_URL}/embed/${Number(
          process.env.BUNNY_VIDEO_LIBRARY_ID
        )}/${videoId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`}
        loading="lazy"
        className={cn("border-0 absolute top-0 h-full w-full rounded-md")}
        allow="accelerometer;gyroscope;encrypted-media;picture-in-picture;"
        onLoad={handleLoad}
        allowFullScreen
      ></iframe>
      {!loaded ? (
        <div className="bg-2 bg-no-repeat bg-cover absolute top-0 left-0 w-full h-full rounded-md animate-pulse bg-slate-800 bg-opacity-50 flex items-center justify-center">
          <AiOutlineLoading3Quarters
            size={50}
            className="text-slate-100 animate-spin"
          />
        </div>
      ) : null}
    </div>
  );
}

export const VideoIframe = React.memo(IFrame);
