import type { Course as ICourse } from "~/utils/db.server";
import { TableCell, TableRow } from "~/components/ui/table";
import { Link } from "@remix-run/react";
import { capitalizeFirstLetter } from "~/utils/helpers";
import { Button } from "~/components/ui/button";
import { FaRegEye } from "react-icons/fa6";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";

export function UserCourse({ course }: { course: ICourse }) {
  return (
    <TableRow>
      <TableCell className="text-blue-700">
        <Button asChild variant={"ghost"}>
          <Link prefetch="intent" to={`/courses/${course.id}`}>
            {capitalizeFirstLetter(course.title)}
          </Link>
        </Button>
      </TableCell>
      <TableCell className="flex items-center justify-end">
        <span className=" text-sky-600"> {course.score}%</span>{" "}
        <Button size="sm" variant={"ghost"} className="font-black text-sky-600">
          <Link prefetch="intent" to={`/courses/${course.id}`}>
            <FaRegEye size={15} />
          </Link>
        </Button>
        <DeleteConfirmationDialog
          title={course.title}
          itemId={course.id}
          itemType="course"
        />
      </TableCell>
    </TableRow>
  );
}
