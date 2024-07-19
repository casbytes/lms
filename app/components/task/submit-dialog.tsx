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
import { TiDocumentAdd } from "react-icons/ti";
import { Form, useNavigation } from "@remix-run/react";
import { CgSpinnerTwo } from "react-icons/cg";
import type { TaskProps } from ".";
import { CheckpointStatus } from "~/constants/enums";

export function SubmitDialog({ task }: { task: TaskProps }) {
  const n = useNavigation();
  const isSubmitting = n.formData?.get("intent") === "submitTask";
  const submitted = task.status === CheckpointStatus.SUBMITTED;
  const disabled = isSubmitting || submitted;

  return (
    <Dialog>
      <Button asChild className="w-full capitalize" variant="secondary">
        <DialogTrigger>
          <TiDocumentAdd className="mr-2" size={25} />
          submit task
        </DialogTrigger>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to submit?</DialogTitle>
        </DialogHeader>
        <DialogFooter className="gap-4 md:gap-0">
          <Button variant="destructive" asChild>
            <DialogClose>No</DialogClose>
          </Button>
          <Form method="post">
            <input type="hidden" name="taskId" value={task.id} />
            <Button
              name="intent"
              value="submitTask"
              type="submit"
              disabled={disabled}
              className="disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <CgSpinnerTwo size={15} className="mr-2 animate-spin" />
              ) : null}
              Yes
            </Button>
          </Form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
