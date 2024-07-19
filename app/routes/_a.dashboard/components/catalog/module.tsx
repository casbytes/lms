import type { CourseProgress, ModuleProgress } from "~/utils/db.server";
import { TableCell, TableRow } from "~/components/ui/table";
import { Link } from "@remix-run/react";
import { capitalizeFirstLetter } from "~/utils/helpers";
import { Button } from "~/components/ui/button";
import { FaRegEye } from "react-icons/fa6";
import { Status } from "~/constants/enums";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";

type ModuleWithCourse = ModuleProgress & {
  courseProgress?: CourseProgress;
};

export function Module({ module }: { module: ModuleWithCourse }) {
  const disabled = module.status === Status.LOCKED;

  return (
    <TableRow>
      <TableCell className="text-blue-700">
        <Button disabled={disabled} variant={"ghost"}>
          <Link prefetch="intent" to={`/modules/${module.id}`}>
            {capitalizeFirstLetter(module.title)}
          </Link>
        </Button>
      </TableCell>

      <TableCell className="flex gap-2 items-center justify-end">
        <span className="text-sm text-sky-600 mr-2"> {module.score}%</span>{" "}
        <Button
          size="sm"
          variant={"ghost"}
          disabled={disabled}
          className="py-1 font-black text-teal-600"
        >
          <Link prefetch="intent" to={`/modules/${module.id}`}>
            <FaRegEye size={20} />
          </Link>
        </Button>
        {module.courseProgress ? null : (
          <DeleteConfirmationDialog
            title={module.title}
            itemId={module.id}
            itemType="module"
          />
        )}
      </TableCell>
    </TableRow>
  );
}
