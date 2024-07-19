import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { AddLinkDialog } from "./add-link-dialog";
import { SubmitDialog } from "./submit-dialog";
import { CommentsDialog } from "./comments-dialog";
import { FaListUl } from "react-icons/fa6";
import type { User } from "~/utils/db.server";
import type { TaskProps } from ".";

type TaskPopoverProps = {
  task: TaskProps;
  userId: string;
  user: User;
};

export function TaskPopover({ task, userId, user }: TaskPopoverProps) {
  return (
    <Popover>
      <Button
        type="button"
        className="rounded-full fixed bottom-5 right-5 md:bottom-10 md:right-10 drop-shadow-2xl px-5 py-10"
        asChild
      >
        <PopoverTrigger disabled={!user.subscribed}>
          <FaListUl size={40} />
        </PopoverTrigger>
      </Button>
      <PopoverContent className="flex flex-col gap-2 max-w-44">
        {task.gradingMethod === "MANNUAL" ? (
          <>
            <CommentsDialog task={task} userId={userId} />
            <Separator />
            <AddLinkDialog task={task} />
            <Separator />
          </>
        ) : null}
        <SubmitDialog task={task} />
      </PopoverContent>
    </Popover>
  );
}
