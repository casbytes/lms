import { TableCell, TableRow } from "~/components/ui/table";
import { capitalizeFirstLetter } from "~/utils/helpers";
import { ConfirmationDialog } from "./confirmation-dialog";
import { Course as ICourse } from "../utils.server";

export function Course({
  course,
  inCatalog,
}: {
  course: ICourse;
  inCatalog: boolean;
}) {
  const courseWithType = { ...course, type: "course" as const };
  return (
    <TableRow>
      <TableCell className="text-lg">
        {capitalizeFirstLetter(course.title)}
      </TableCell>
      <TableCell className="flex gap-6 items-center justify-end">
        <ConfirmationDialog item={courseWithType} inCatalog={inCatalog} />
      </TableCell>
    </TableRow>
  );
}
