import { ICourseProgress } from "~/constants/types";
import { TableCell, TableRow } from "../ui/table";
import { Link } from "@remix-run/react";
import { capitalizeFirstLetter } from "~/utils/helpers";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { FaRegEye } from "react-icons/fa6";

export function Course({ course }: { course: ICourseProgress }) {
  return (
    <TableRow>
      <TableCell className="text-blue-700">
        <Button asChild variant={"ghost"}>
          <Link prefetch="intent" to={`/courses/${course.id}`}>
            {capitalizeFirstLetter(course.title)}
          </Link>
        </Button>
      </TableCell>

      <TableCell className="flex gap-4 items-center justify-end">
        <Badge className="text-sm mr-2"> {course.score}%</Badge>{" "}
        <Link prefetch="intent" to={`/courses/${course.id}`}>
          <Button
            className="bg-teal-500 hover:bg-teal-400 py-1 font-black"
            size="icon"
          >
            <FaRegEye size={20} />
          </Button>
        </Link>
      </TableCell>
    </TableRow>
  );
}
