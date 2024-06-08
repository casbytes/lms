import React from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { cn } from "~/libs/shadcn";

type IframeProps = {
  videoId: string;
  className?: string;
  src: string;
};

function IFrame({ videoId, src, className }: IframeProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  function handleLoad() {
    setIsLoading(false);
  }

  return (
    <div className={cn("relative mt-8 pt-[56.25%]", className)}>
      <iframe
        src={`${src}/${videoId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`}
        id="iframe"
        loading="lazy"
        className={cn(
          "border-0 absolute top-0 h-full w-full rounded-md"
          // isLoading ? "hidden" : "block"
        )}
        allow="accelerometer;gyroscope;encrypted-media;picture-in-picture;"
        allowFullScreen
        // onLoad={handleLoad}
      />
      {/* {isLoading ? (
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="bg-black/50 bg-opacity-90 flex items-center justify-center h-full rounded-md">
            <AiOutlineLoading3Quarters
              size={50}
              className="text-sky-300 animate-spin"
            />
          </div>
        </div>
      ) : null} */}
    </div>
  );
}

export { IFrame };
