import { Link, useFetcher } from "@remix-run/react";
import { FaPlus, FaSpinner } from "react-icons/fa6";
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
import type { ICourse, IModule, IUser } from "~/constants/types";
import { capitalizeFirstLetter } from "~/utils/helpers";

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
  user?: IUser;
  item: Course | Module;
  inCatalog: boolean;
}) {
  const f = useFetcher();
  const isSubmitting = f.formData?.get("intent") === "addToCatalog";

  return (
    <Dialog>
      <Button
        className="px-4 py-1 flex items-center bg-indigo-500 hover:bg-indigo-400"
        size={"sm"}
        asChild
      >
        <DialogTrigger className="px-4 flex items-center disabled:bg-slate-200 disabled:cursor-not-allowed rounded-md">
          {" "}
          <FaPlus className="mr-2" /> add
        </DialogTrigger>
      </Button>
      {inCatalog ? (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              You can't add a new course or module to your catalog.
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
        </DialogContent>
      ) : !inCatalog && !user?.subscribed && item.type === "module" ? (
        <DialogContent>
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
        </DialogContent>
      ) : (
        <DialogContent>
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
                f.submit(
                  {
                    intent:
                      item.type === "course"
                        ? "addCourseToCatalog"
                        : "addModuleToCatalog",
                    itemId: item.id,
                  },
                  { method: "POST" }
                );
              }}
            >
              {isSubmitting ? (
                <FaSpinner className="mr-2 animate-spin" />
              ) : null}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
