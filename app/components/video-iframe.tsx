import React from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { cn } from "~/libs/shadcn";

type IframeProps = {
  videoId: string;
  className?: string;
  videoCredentials: {
    iframeUrl: string;
    libraryId: string;
  };
};

export function IFrame({ videoId, videoCredentials, className }: IframeProps) {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const iframe = document.getElementById("iframe");
    const handleLoad = () => setIsLoading(false);

    if (iframe) {
      iframe.addEventListener("load", handleLoad);
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener("load", handleLoad);
      }
    };
  }, []);

  return (
    <div className={cn("relative pt-[56.25%]", className)}>
      <iframe
        id="iframe"
        src={`${videoCredentials.iframeUrl}/embed/${Number(
          videoCredentials.libraryId
        )}/${videoId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`}
        loading="lazy"
        className={cn(
          "border-0 absolute top-0 h-full w-full rounded-md",
          isLoading ? "hidden" : "block"
        )}
        allow="accelerometer;gyroscope;encrypted-media;picture-in-picture;"
        onLoad={() => setIsLoading(false)}
        allowFullScreen
      ></iframe>
      {isLoading ? (
        <div className="absolute top-0 left-0 w-full h-full rounded-md animate-pulse bg-slate-400 bg-opacity-50 flex items-center justify-center">
          <AiOutlineLoading3Quarters
            size={50}
            className="text-slate-500 animate-spin"
          />
        </div>
      ) : null}
    </div>
  );
}

export const VideoIframe = React.memo(IFrame);
