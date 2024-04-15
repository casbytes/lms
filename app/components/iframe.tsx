import { cn } from "~/libs/shadcn";

type IframeProps = {
  videoId: string;
  className?: string;
};

export function Iframe({ videoId, className }: IframeProps) {
  return (
    <div className={cn("relative pt-[56.25%]", className)}>
      <iframe
        src={`https://iframe.mediadelivery.net/embed/230663/${videoId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`}
        loading="lazy"
        className="border-0 absolute top-0 h-full w-full"
        allow="accelerometer;gyroscope;encrypted-media;picture-in-picture;"
        allowFullScreen
      ></iframe>
    </div>
  );
}
