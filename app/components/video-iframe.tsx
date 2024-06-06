import React from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { cn } from "~/libs/shadcn";

type IframeProps = {
  videoId: string;
  className?: string;
  videoSource: string;
};

export function IFrame({ videoId, videoSource, className }: IframeProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const iframeRef = React.useRef(null);

  const handleLoad = () => setIsLoading(false);

  React.useEffect(() => {
    if (iframeRef.current) {
      (iframeRef.current as HTMLIFrameElement)?.addEventListener(
        "load",
        handleLoad
      );
    }

    return () => {
      if (iframeRef.current) {
        (iframeRef.current as HTMLIFrameElement)?.removeEventListener(
          "load",
          handleLoad
        );
      }
    };
  }, []);

  return (
    <div className={cn("relative pt-[56.25%]", className)}>
      <iframe
        id="iframe"
        ref={iframeRef}
        src={`${videoSource}/${videoId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`}
        loading="lazy"
        className={cn(
          "border-0 absolute top-0 h-full w-full rounded-md",
          isLoading ? "hidden" : "block"
        )}
        allow="accelerometer;gyroscope;encrypted-media;picture-in-picture;"
        allowFullScreen
        onLoad={handleLoad}
      ></iframe>
      {isLoading ? (
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="bg-black bg-opacity-90 flex items-center justify-center h-full rounded-md">
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
