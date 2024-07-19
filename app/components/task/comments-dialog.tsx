import React from "react";
import { useFetcher } from "@remix-run/react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Comments } from "./comments";
import { FaComments, FaPlus } from "react-icons/fa6";
import { Textarea } from "../ui/textarea";
import { CgSpinnerTwo } from "react-icons/cg";
import type { TaskProps } from ".";

type CommentsDialogProps = {
  task: TaskProps;
  userId: string;
};

export function CommentsDialog({ task, userId }: CommentsDialogProps) {
  const [isDisabled, setIsDisabled] = React.useState(true);

  const f = useFetcher();
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const isSubmitting = f.formData?.get("intent") === "addComment";

  function handleInputChange() {
    const inputLength = inputRef.current?.value.length;
    if (!inputLength || inputLength < 5) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }

  React.useEffect(() => {
    if (!isSubmitting && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [isSubmitting]);

  return (
    <Dialog>
      <Button asChild className="w-full capitalize" variant="secondary">
        <DialogTrigger>
          <FaComments className="mr-2" size={25} />
          comments
        </DialogTrigger>
      </Button>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-scroll">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>
        <Comments task={task} userId={userId} />
        <f.Form method="post" className="w-full flex flex-col gap-4">
          <input type="hidden" name="taskId" value={task.id} required />
          <Textarea
            ref={inputRef}
            name="comment"
            onChange={handleInputChange}
            placeholder="Add your comment here..."
          />
          <DialogFooter className="gap-4 md:gap-0">
            <Button variant="destructive" asChild>
              <DialogClose>Close</DialogClose>
            </Button>

            <Button
              name="intent"
              value="addComment"
              className="self-end"
              disabled={isDisabled || isSubmitting}
            >
              {isSubmitting ? (
                <CgSpinnerTwo size={15} className="mr-2 animate-spin" />
              ) : (
                <FaPlus size={15} className="mr-2" />
              )}
              add comment
            </Button>
          </DialogFooter>
        </f.Form>
      </DialogContent>
    </Dialog>
  );
}
