import { Link, useNavigation, useSubmit } from "@remix-run/react";
import { CgSpinnerTwo } from "react-icons/cg";
import { FaPlus } from "react-icons/fa6";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import type { Module as IModule, Course as ICourse } from "../utils.server";
import { capitalizeFirstLetter } from "~/utils/helpers";
import { User } from "~/utils/db.server";

interface Module extends IModule {
  type: string;
}

interface Course extends ICourse {
  type: string;
}

export function ConfirmationDialog({
  item,
  user,
  inCatalog,
}: {
  user?: User;
  item: Course | Module;
  inCatalog: boolean;
}) {
  const submit = useSubmit();
  const n = useNavigation();
  const isSubscribed = user?.subscribed;
  const isSubmitting = n.formData?.get("intent") === "addCourseToCatalog";
  const submitOptions = {
    intent:
      item.type === "course" ? "addCourseToCatalog" : "addModuleToCatalog",
    itemId: item.id,
  };
  return (
    <Dialog>
      <Button
        className="px-4 py-1 flex items-center bg-indigo-500 hover:bg-indigo-400"
        size={"sm"}
        asChild
      >
        <DialogTrigger
          disabled={isSubmitting}
          className="px-4 flex items-center disabled:bg-slate-200 disabled:cursor-not-allowed rounded-md"
        >
          {" "}
          {isSubmitting ? (
            <CgSpinnerTwo className="mr-2 animate-spin" />
          ) : (
            <FaPlus className="mr-2" />
          )}
          add
        </DialogTrigger>
      </Button>
      <DialogContent>
        {inCatalog ? (
          <>
            <DialogHeader>
              <DialogTitle>
                You can&apos;t add a new course or module to your catalog.
              </DialogTitle>
              <DialogDescription>
                You have an ongoing course or module in your catalog, please
                complete it before adding another one.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant={"outline"} asChild>
                <DialogClose>Close</DialogClose>
              </Button>
            </DialogFooter>
          </>
        ) : !inCatalog && !isSubscribed && item.type === "module" ? (
          <>
            <DialogHeader>
              <DialogTitle>
                You must be subscribed to add this module to your catalog.
              </DialogTitle>
            </DialogHeader>
            <DialogFooter>
              <Button variant={"outline"} asChild>
                <DialogClose>Close</DialogClose>
              </Button>
              <Button asChild>
                <Link to="/subscription">Subscribe</Link>
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                Are you sure you want to add this {item.type} to your catalog?
              </DialogTitle>
              <DialogDescription className="text-lg">
                {capitalizeFirstLetter(item.title)}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant={"outline"} asChild>
                <DialogClose>Cancel</DialogClose>
              </Button>
              <Button
                className="bg-indigo-500 hover:bg-indigo-400 py-1 font-black"
                disabled={isSubmitting || inCatalog}
                onClick={() => {
                  submit(submitOptions, { method: "POST" });
                }}
                asChild
              >
                <DialogClose>Confirm</DialogClose>
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
