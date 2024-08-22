import { cn } from "~/libs/shadcn";

type IframeProps = {
  videoId: string;
  className?: string;
};

function IFrame({ videoId, className }: IframeProps) {
  return (
    <div className={cn("relative mt-8 pt-[56.25%]", className)}>
      <iframe
        src={`${ENV.VIDEO_SOURCE_URL}/${videoId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`}
        title="Video iframe"
        loading="lazy"
        className={cn("border-0 absolute top-0 h-full w-full rounded-sm")}
        allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
        allowFullScreen
      />
    </div>
  );
}

export { IFrame };
