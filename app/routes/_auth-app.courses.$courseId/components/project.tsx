import { Link } from "@remix-run/react";
import { CircleDotDashed, LockKeyhole } from "lucide-react";
import { BsLockFill, BsUnlockFill } from "react-icons/bs";
import { FaProjectDiagram } from "react-icons/fa";
import { Button } from "~/components/ui/button";
import { cn } from "~/libs/shadcn";
import { capitalizeFirstLetter } from "~/utils/cs";

export function Project({ modules, index }: any) {
  const project = modules[0]?.course?.project[0];

  const completed = project.status === "COMPLETED";
  const inProgress = project.status === "IN_PROGRESS";
  const locked = project.status === "LOCKED";
  return (
    <div className="w-full">
      <Button
        disabled={locked}
        aria-label={project.title}
        className={cn(
          "overflow-x-auto flex border-l-8 border-b-2 text-zinc-700 border-zinc-500 bg-zinc-200 hover:bg-zinc-300 justify-between w-full text-lg",
          {
            "border-sky-600": completed,
          }
        )}
      >
        <Link to="/courses/project" className="flex gap-4 items-center">
          <div className="sr-only">project status</div>
          {locked ? (
            <LockKeyhole size={20} />
          ) : inProgress ? (
            <CircleDotDashed size={20} />
          ) : (
            <FaProjectDiagram
              className={cn("text-zinc-600", {
                "text-sky-700": completed,
              })}
              size={20}
            />
          )}
          <div className="flex items-center gap-4">
            {capitalizeFirstLetter(project.title)}{" "}
          </div>{" "}
        </Link>

        {index >= 2 ? (
          <BsLockFill className="text-zinc-500 absolute sm:static right-8" />
        ) : (
          <BsUnlockFill className="text-zinc-500 absolute sm:static right-8" />
        )}
      </Button>
    </div>
  );
}
