import { Link, useSearchParams } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { cn } from "~/libs/shadcn";
import { capitalizeFirstLetter } from "~/utils/cs";
import { FaCheckSquare } from "react-icons/fa";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import { MdQuiz } from "react-icons/md";
import { LuCircleDotDashed } from "react-icons/lu";
import { FiCheckCircle } from "react-icons/fi";
import { SlLock } from "react-icons/sl";
import { ISubModuleProgress, Status } from "~/constants/types";

type SubModuleItemProps = {
  item: ISubModuleProgress;
  index: number;
};

export function SubModuleItem({ item, index }: SubModuleItemProps) {
  const locked = item.status === Status.LOCKED;
  const inProgress = item.status === Status.IN_PROGRESS;
  const completed = item.status === Status.COMPLETED;

  return (
    <>
      <Button
        disabled={locked}
        className="rounded-md text-black bg-stone-200 hover:bg-stone-300 py-4 relative border-b-2 border-zinc-600"
      >
        <Link
          prefetch="intent"
          to={`/sub-modules/${item.id}`}
          className="flex flex-1 justify-between items-center p-2"
        >
          <div
            className={cn(
              "absolute rounded-tl rounded-br text-slate-50 text-xs p-1 bg-zinc-600 top-0 left-0",
              {
                "bg-sky-600": completed,
              }
            )}
          >
            {index + 1}
          </div>
          <div className="text-lg pl-6 overflow-x-auto flex gap-4 items-center">
            {capitalizeFirstLetter(item?.title)}
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
    </>
  );
}
