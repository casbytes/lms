import { Link, useFetcher } from "@remix-run/react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { cn } from "~/libs/shadcn";
import { MdDeleteForever } from "react-icons/md";
import { CgSpinnerTwo } from "react-icons/cg";
import { CheckpointStatus, Status } from "~/constants/enums";
import type { TaskProps } from ".";

export function TaskTable({ task }: { task: TaskProps }) {
  const CUT_OFF_SCORE = 80;
  const isSubmitted = task.status === CheckpointStatus.SUBMITTED;
  const isGraded = task.status === CheckpointStatus.GRADED;
  const isLocked = task.status === Status.LOCKED;

  const statusClassname = cn({
    "bg-sky-500 hover:bg-sky-400": isSubmitted,
  });

  const className = cn({
    "bg-red-500 hover:bg-red-400": isLocked || task.score < CUT_OFF_SCORE,
    "bg-yellow-600 hover:bg-yellow-400": isGraded && task.score < CUT_OFF_SCORE,
  });

  const f = useFetcher();
  const linkId = f.formData?.get("linkId");

  return (
    <div className="flex flex-col md:flex-nowrap gap-6">
      <Table className="bg-zinc-100 border-2">
        <TableCaption>Task Status</TableCaption>
        <TableHeader className="text-lg">
          <TableRow>
            <TableHead>Status:</TableHead>
            <TableHead>Score:</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>
              <Badge className={cn(className, statusClassname)}>
                {task.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge className={className}>{task.score}%</Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Table className="bg-zinc-100 border-2">
        <TableCaption>Links</TableCaption>
        <TableHeader className="text-lg">
          <TableRow>
            <TableHead>Type:</TableHead>
            <TableHead>URL:</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {task.links?.length ? (
            task.links.map((link) => (
              <TableRow key={link.id}>
                <TableCell>
                  <span>{link.title}</span>
                </TableCell>
                <TableCell>
                  <div className="flex justify-between tasks-center w-full">
                    <Link
                      to={link.url}
                      target="_blank"
                      className="text-blue-600"
                      rel="noreferrer"
                    >
                      {link.url}
                    </Link>
                    <f.Form method="post">
                      <input type="hidden" name="linkId" value={link.id} />
                      <input type="hidden" name="taskId" value={task.id} />
                      <button
                        name="intent"
                        value="deleteLink"
                        disabled={linkId === link.id}
                      >
                        {linkId === link.id ? (
                          <CgSpinnerTwo size={20} className="animate-spin" />
                        ) : (
                          <MdDeleteForever size={20} className="text-red-600" />
                        )}
                      </button>
                    </f.Form>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2}>
                <p className="text-slate-600 text-center">
                  Added links will appear here.
                </p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
