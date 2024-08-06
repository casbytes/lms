import { Link } from "@remix-run/react";
import type { Project, User } from "~/utils/db.server";
import { BsLockFill, BsUnlockFill } from "react-icons/bs";
import { FaProjectDiagram } from "react-icons/fa";
import { LuCircleDotDashed } from "react-icons/lu";
import { Button } from "~/components/ui/button";
import { cn } from "~/libs/shadcn";
import { capitalizeFirstLetter, STATUS } from "~/utils/helpers";

type ProjectProps = {
  user: User;
  project: Project;
};

export function Project({ project, user }: ProjectProps) {
  const IS_ACTIVE = user.subscribed;
  const COMPLETED = project?.status === STATUS.COMPLETED;
  const IN_PROGRESS = project?.status === STATUS.IN_PROGRESS;
  const LOCKED = project?.status === STATUS.LOCKED || !IS_ACTIVE;
  return (
    <div className="w-full">
      <Button
        // disabled={LOCKED}
        aria-label={project.title}
        className={cn(
          "overflow-x-auto flex border-l-8 border-b-2 text-zinc-700 border-zinc-500 bg-zinc-200 hover:bg-zinc-300 justify-between w-full text-lg",
          {
            "border-sky-600": COMPLETED,
          }
        )}
      >
        <Link
          to={`/project/${project?.id}`}
          className="flex gap-4 items-center"
        >
          <div className="sr-only">project status</div>
          {LOCKED ? (
            <FaProjectDiagram size={20} />
          ) : IN_PROGRESS ? (
            <LuCircleDotDashed size={20} />
          ) : (
            <FaProjectDiagram
              className={cn("text-zinc-600", {
                "text-sky-700": COMPLETED,
              })}
              size={20}
            />
          )}
          <div className="flex items-center gap-4">
            {capitalizeFirstLetter(project.title)}{" "}
          </div>{" "}
        </Link>

        {!IS_ACTIVE ? (
          <BsLockFill className="text-zinc-500 absolute sm:static right-8" />
        ) : (
          <BsUnlockFill className="text-zinc-500 absolute sm:static right-8" />
        )}
      </Button>
    </div>
  );
}
