import { Link } from "@remix-run/react";
import type { Project, User } from "~/utils/db.server";
import { BsLockFill, BsUnlockFill } from "react-icons/bs";
import { FaProjectDiagram } from "react-icons/fa";
import { LuCircleDotDashed } from "react-icons/lu";
import { SlLock } from "react-icons/sl";
import { Button } from "~/components/ui/button";
import { cn } from "~/libs/shadcn";
import { capitalizeFirstLetter } from "~/utils/helpers";
import { Status } from "~/constants/enums";

type ProjectProps = {
  user: User;
  project: Project;
};

export function Project({ project, user }: ProjectProps) {
  const isActive = user.subscribed;
  const completed = project?.status === Status.COMPLETED;
  const inProgress = project?.status === Status.IN_PROGRESS;
  const locked = project?.status === Status.LOCKED || !isActive;
  return (
    <div className="w-full">
      <Button
        // disabled={locked}
        aria-label={project?.title}
        className={cn(
          "overflow-x-auto flex border-l-8 border-b-2 text-zinc-700 border-zinc-500 bg-zinc-200 hover:bg-zinc-300 justify-between w-full text-lg",
          {
            "border-sky-600": completed,
          }
        )}
      >
        <Link
          to={`/project/${project?.id}`}
          className="flex gap-4 items-center"
        >
          <div className="sr-only">project status</div>
          {locked ? (
            <FaProjectDiagram size={20} />
          ) : inProgress ? (
            <LuCircleDotDashed size={20} />
          ) : (
            <FaProjectDiagram
              className={cn("text-zinc-600", {
                "text-sky-700": completed,
              })}
              size={20}
            />
          )}
          <div className="flex items-center gap-4">
            {capitalizeFirstLetter(project?.title ?? "Matters choke!")}{" "}
          </div>{" "}
        </Link>

        {!isActive ? (
          <BsLockFill className="text-zinc-500 absolute sm:static right-8" />
        ) : (
          <BsUnlockFill className="text-zinc-500 absolute sm:static right-8" />
        )}
      </Button>
    </div>
  );
}
