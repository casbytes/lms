export { TaskTable } from "./task-table";
export { AddLinkDialog } from "./add-link-dialog";
export { SubmitDialog } from "./submit-dialog";
export { TaskPopover } from "./task-popover";

export interface TaskLink {
  id: string;
  url: string;
  title: string;
}

export interface TaskComment {
  id: string;
  content: string;
  userId: string;
}

export interface TaskData<T = TaskLink | TaskComment> {
  id: string;
  title: string;
  status: string;
  score: number;
  links?: T[];
  comments?: T[];
}

export interface TaskProps<T extends TaskData = TaskData> {
  task: T;
  userId?: string;
}
