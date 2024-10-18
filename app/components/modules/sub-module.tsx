import { Link, useMatches } from "@remix-run/react";
import { type User, type SubModule as ISubmodule } from "~/utils/db.server";
import { Button } from "~/components/ui/button";
import { cn } from "~/libs/shadcn";
import { LuCircleDotDashed } from "react-icons/lu";
import { FiCheckCircle } from "react-icons/fi";
import { SlLock } from "react-icons/sl";
import { capitalizeFirstLetter, STATUS } from "~/utils/helpers";

type SubModuleItemProps = {
  user: User;
  submodule: ISubmodule;
  isPremium?: boolean;
  index: number;
};

export function SubModule({
  submodule,
  index,
  isPremium,
  user,
}: SubModuleItemProps) {
  const IS_SUBSCRIBED = user.subscribed;
  const IN_PROGRESS = submodule.status === STATUS.IN_PROGRESS;
  const COMPLETED = submodule.status === STATUS.COMPLETED;
  const LOCKED =
    submodule.status === STATUS.LOCKED ||
    (!IS_SUBSCRIBED && isPremium && !IN_PROGRESS);

  const matches = useMatches();

  const isModule = matches.some((match) =>
    match.id.includes("routes/_a.modules.$moduleId")
  );
  const type = isModule ? "?type=module" : "";

  return (
    <Button
      disabled={LOCKED}
      className="rounded-md text-black bg-stone-200 py-4 relative border-b-2 border-zinc-600 hover:bg-stone-300 disabled:cursor-not-allowed"
    >
      <Link
        prefetch="intent"
        to={`/sub-modules/${submodule.id}${type}`}
        className="flex flex-1 justify-between submodules-center p-2"
      >
        <div
          className={cn(
            "absolute rounded-tl rounded-br text-slate-50 text-xs p-1 bg-zinc-600 top-0 left-0",
            {
              "bg-sky-600": COMPLETED,
            }
          )}
        >
          {index + 1}
        </div>
        <div className="text-lg pl-6 overflow-x-auto flex gap-4 submodules-center">
          {capitalizeFirstLetter(submodule?.title)}
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
