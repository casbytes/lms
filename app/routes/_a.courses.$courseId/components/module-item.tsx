import { useNavigation, useSubmit } from "@remix-run/react";
import { CircleCheckBig, CircleDotDashed, LockKeyhole } from "lucide-react";
import React from "react";
import { BsLockFill, BsUnlockFill } from "react-icons/bs";
import { CgSpinnerTwo } from "react-icons/cg";
import { Button } from "~/components/ui/button";
import { cn } from "~/libs/shadcn";
import { capitalizeFirstLetter } from "~/utils/cs";

export function ModuleItem({ module, index }: any) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const moduleId = navigation.formData?.get("moduleId");

  const completed = module.status === "COMPLETED";
  const inProgress = module.status === "IN_PROGRESS";
  const locked = module.status === "LOCKED";

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
          }
        )}
      >
        <div className="flex gap-4 items-center">
          <div className="sr-only">Module status</div>
          {module.id === moduleId ? (
            <CgSpinnerTwo size={20} className="animate-spin" />
          ) : locked ? (
            <LockKeyhole size={20} />
          ) : inProgress ? (
            <CircleDotDashed size={20} />
          ) : (
            <CircleCheckBig size={20} />
          )}
          <div className="flex items-center gap-4">
            {capitalizeFirstLetter(module.title)}{" "}
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
