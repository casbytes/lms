import type { Checkpoint, Link, Project } from "~/utils/db.server";
export { TaskTable } from "./task-table";
export { AddLinkDialog } from "./add-link-dialog";
export { SubmitDialog } from "./submit-dialog";
export { TaskPopover } from "./task-popover";

type ICheckpoint = Checkpoint & {
  links?: Link[];
};

type IProject = Project & {
  links?: Link[];
};

export type TaskProps = ICheckpoint | IProject;
