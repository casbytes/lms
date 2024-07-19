import { Link } from "@remix-run/react";
import type { Checkpoint as ICheckpoint } from "~/utils/db.server";
import { FiCheckCircle } from "react-icons/fi";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import { LuCircleDotDashed } from "react-icons/lu";
import { SlLock } from "react-icons/sl";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/libs/shadcn";
import { capitalizeFirstLetter } from "~/utils/helpers";
import { Status } from "~/constants/enums";

type CheckpointProps = {
  checkpoint: ICheckpoint;
};

export function Checkpoint({ checkpoint }: CheckpointProps) {
  const LOCKED = checkpoint.status === Status.LOCKED;
  const IN_PROGRESS = checkpoint.status === Status.IN_PROGRESS;
  const COMPLETED = checkpoint.status === Status.COMPLETED;

  const checkpointUrl = `/checkpoint/${checkpoint.id}?${
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
        prefetch="intent"
        to={checkpointUrl}
        className="flex flex-1 justify-between items-center p-2"
      >
        <div className="absolute p-1 left-0">
          <IoShieldCheckmarkSharp
            size={20}
            className={cn("text-zinc-700", {
              "text-sky-700": COMPLETED,
            })}
          />
        </div>
        <div className="text-lg pl-6 overflow-x-auto flex gap-2 items-center">
          {capitalizeFirstLetter(checkpoint.title)}{" "}
          <Badge
            className={cn("bg-zinc-600", {
              "bg-sky-600": COMPLETED,
            })}
          >
            {checkpoint.score} %
          </Badge>
        </div>
        {LOCKED ? (
          <SlLock size={20} className="absolute sm:static right-2" />
        ) : IN_PROGRESS ? (
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
