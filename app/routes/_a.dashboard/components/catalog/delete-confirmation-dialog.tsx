import { useNavigation, useSubmit } from "@remix-run/react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { MdDeleteForever } from "react-icons/md";
import { CgSpinnerTwo } from "react-icons/cg";

export function DeleteConfirmationDialog({
  title,
  itemId,
  itemType,
}: {
  title: string;
  itemId: string;
  itemType: string;
}) {
  const submit = useSubmit();
  const n = useNavigation();
  const isDeleting =
    itemType === "course"
      ? n.formData?.get("intent") === "deleteCourse"
      : n.formData?.get("intent") === "deleteModule";

  const submitOptions = {
    intent: itemType === "course" ? "deleteCourse" : "deleteModule",
    itemId,
  };
  return (
    <Dialog>
      <Button size="sm" variant={"ghost"} className="py-1 font-black" asChild>
        <DialogTrigger disabled={isDeleting}>
          {isDeleting ? (
            <CgSpinnerTwo size={20} className="animate-spin" />
          ) : (
            <MdDeleteForever size={20} className="text-red-500" />
          )}{" "}
        </DialogTrigger>
      </Button>

      <DialogContent>
        <DialogTitle>Are you sure you want to delete {title}?</DialogTitle>
        <DialogDescription>
          <ul>
            <li>
              All the data associated with{" "}
              <span className="bg-sky-100 rounded-md p-1"> {title}</span> will
              be permanently deleted.
            </li>
            <li>
              All progress associated with{" "}
              <span className="bg-sky-100 rounded-md p-1"> {title}</span> will
              be lost.
            </li>
            <li>This action cannot be undone.</li>
          </ul>
        </DialogDescription>
        <DialogFooter>
          <Button variant="secondary">
            <DialogClose>Cancel</DialogClose>
          </Button>
          <DialogClose>
            <Button
              onClick={() => submit(submitOptions, { method: "POST" })}
              variant="destructive"
              disabled={isDeleting}
            >
              Yes
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
