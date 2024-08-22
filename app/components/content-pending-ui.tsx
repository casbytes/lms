import { PiSpinnerGap } from "react-icons/pi";
import { cn } from "~/libs/shadcn";

type CPUProps = {
  className?: string;
};

export function ContentPendingUI({ className }: CPUProps) {
  return (
    <div
      className={cn(
        "w-full h-auto md:h-[calc(100vh-20rem)] flex items-center justify-center rounded-md bg-gray-900 bg-opacity-75 animate-pulse",
        className
      )}
    >
      <PiSpinnerGap size={100} className="animate-spin text-sky-300" />
    </div>
  );
}
