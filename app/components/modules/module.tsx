import { useNavigation, useSearchParams, useSubmit } from "@remix-run/react";
import { type User, type Module as IModule } from "~/utils/db.server";
import { SheetClose } from "../ui/sheet";
import { Button } from "../ui/button";
import { cn } from "~/libs/shadcn";
import { CgSpinnerTwo } from "react-icons/cg";
import { SlLock } from "react-icons/sl";
import { LuCircleDotDashed } from "react-icons/lu";
import { FiCheckCircle } from "react-icons/fi";
import { capitalizeFirstLetter, STATUS } from "~/utils/helpers";
import { BsLockFill, BsUnlockFill } from "react-icons/bs";

type ModuleItemProps = {
  user: User;
  module: IModule;
};

export function Module({ module, user }: ModuleItemProps) {
  const [searchParams] = useSearchParams();
  const submit = useSubmit();
  const navigation = useNavigation();
  const moduleId = navigation.formData?.get("moduleId");
  const currentModuleId = searchParams.get("moduleId");

  const isCurrentModule = currentModuleId === module.id;

  /**
   * The user is not subscribed and the module is premium (paid)
   */
  const IS_SUBSCRIBED = user.subscribed;
  const IS_PREMIUM = module.premium;
  const IN_PROGRESS = module.status === STATUS.IN_PROGRESS;
  const COMPLETED = module.status === STATUS.COMPLETED;
  const LOCKED =
    module.status === STATUS.LOCKED ||
    (!IS_SUBSCRIBED && IS_PREMIUM && !IN_PROGRESS);

  return (
    <li className="w-full">
      <SheetClose asChild>
        <Button
          // disabled={locked }
          aria-label={module.title}
          onClick={() => submit({ moduleId: module.id })}
          className={cn(
            "overflow-x-auto flex border-l-8 border-b-2 text-zinc-700 border-zinc-500 bg-zinc-200 hover:bg-zinc-300 justify-between w-full text-lg",
            {
              "border-sky-600": COMPLETED,
              "border-sky-700 text-sky-800 bg-zinc-200/50": isCurrentModule,
            }
          )}
        >
          <div className="flex gap-4 items-center">
            <div className="sr-only">Module status</div>
            {module.id === moduleId ? (
              <CgSpinnerTwo size={20} className="animate-spin" />
            ) : LOCKED ? (
              <SlLock size={20} />
            ) : IN_PROGRESS ? (
              <LuCircleDotDashed size={20} />
            ) : (
              <FiCheckCircle size={20} />
            )}
            <div className="flex items-center gap-4">
              {capitalizeFirstLetter(module.title)}{" "}
            </div>{" "}
          </div>

          {IS_SUBSCRIBED ? (
            <BsUnlockFill className="text-zinc-500 absolute sm:static right-8" />
          ) : (
            <BsLockFill className="text-zinc-500 absolute sm:static right-8" />
          )}
        </Button>
      </SheetClose>
    </li>
  );
}
