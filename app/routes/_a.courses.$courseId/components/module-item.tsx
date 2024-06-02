import { useNavigation, useSearchParams, useSubmit } from "@remix-run/react";
import { BsLockFill, BsUnlockFill } from "react-icons/bs";
import { CgSpinnerTwo } from "react-icons/cg";
import { FiCheckCircle } from "react-icons/fi";
import { LuCircleDotDashed } from "react-icons/lu";
import { SlLock } from "react-icons/sl";
import { Button } from "~/components/ui/button";
import { ISubModuleProgress, Status } from "~/constants/types";
import { cn } from "~/libs/shadcn";
import { capitalizeFirstLetter } from "~/utils/cs";

type ModuleItemProps = {
  module: ISubModuleProgress;
  index: number;
};

export function ModuleItem({ module, index }: ModuleItemProps) {
  const [searchParams] = useSearchParams();
  const submit = useSubmit();
  const navigation = useNavigation();
  const moduleId = navigation.formData?.get("moduleId");
  const currentModuleId = searchParams.get("moduleId");

  const completed = module.status === Status.COMPLETED;
  const inProgress = module.status === Status.IN_PROGRESS;
  const locked = module.status === Status.LOCKED;

  return (
    <li key={`${module.id}-${index}`} className="w-full">
      <Button
        // disabled={locked}
        aria-label={module.title}
        onClick={() => submit({ moduleId: module.id })}
        className={cn(
          "overflow-x-auto flex border-l-8 border-b-2 text-zinc-700 border-zinc-500 bg-zinc-200 hover:bg-zinc-300 justify-between w-full text-lg",
          {
            "border-sky-600": completed,
            "border-sky-700 text-sky-800 bg-zinc-200/50":
              currentModuleId === module.id,
          }
        )}
      >
        <div className="flex gap-4 items-center">
          <div className="sr-only">Module status</div>
          {module.id === moduleId ? (
            <CgSpinnerTwo size={20} className="animate-spin" />
          ) : locked ? (
            <SlLock size={20} />
          ) : inProgress ? (
            <LuCircleDotDashed size={20} />
          ) : (
            <FiCheckCircle size={20} />
          )}
          <div className="flex items-center gap-4">
            {capitalizeFirstLetter(module?.title)}{" "}
          </div>{" "}
        </div>

        {index >= 2 ? (
          <BsLockFill className="text-zinc-500 absolute sm:static right-8" />
        ) : (
          <BsUnlockFill className="text-zinc-500 absolute sm:static right-8" />
        )}
      </Button>
    </li>
  );
}
