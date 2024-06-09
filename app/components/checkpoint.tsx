import { Link } from "@remix-run/react";
import { FiCheckCircle } from "react-icons/fi";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import { LuCircleDotDashed } from "react-icons/lu";
import { SlLock } from "react-icons/sl";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ICheckpoint, Status } from "~/constants/types";
import { cn } from "~/libs/shadcn";
import { capitalizeFirstLetter } from "~/utils/cs";

type CheckpointProps = {
  checkpoint: ICheckpoint;
};

export function Checkpoint({ checkpoint }: CheckpointProps) {
  const locked = checkpoint.status === Status.LOCKED;
  const inProgress = checkpoint.status === Status.IN_PROGRESS;
  const completed = checkpoint.status === Status.COMPLETED;

  const checkpointLink = `/checkpoint/${checkpoint.id}?${
    checkpoint?.moduleProgressId
      ? `moduleId=${checkpoint.moduleProgressId}`
      : `submoduleId=${checkpoint.subModuleProgressId}`
  }`;

  return (
    <Button
      // disabled={locked}
      className="rounded-md text-black bg-stone-200 hover:bg-stone-300 py-4 relative border-b-2 border-zinc-600 w-full"
    >
      <Link
        to={checkpointLink}
        className="flex flex-1 justify-between items-center p-2"
      >
        <div className="absolute p-1 left-0">
          <IoShieldCheckmarkSharp
            size={20}
            className={cn("text-zinc-700", {
              "text-sky-700": completed,
            })}
          />
        </div>
        <div className="text-lg pl-6 overflow-x-auto flex gap-2 items-center">
          {capitalizeFirstLetter(checkpoint.title)}{" "}
          <Badge>{checkpoint.score} %</Badge>
        </div>
        {locked ? (
          <SlLock size={20} className="absolute sm:static right-2" />
        ) : inProgress ? (
          <LuCircleDotDashed
            size={20}
            className="text-sky-700 absolute sm:static right-2"
          />
        ) : (
          <FiCheckCircle
            size={20}
            className="text-sky-700 absolute sm:static right-2"
          />
        )}
      </Link>
    </Button>
  );
}
