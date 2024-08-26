import { TableCell, TableRow } from "~/components/ui/table";
import { capitalizeFirstLetter } from "~/utils/helpers";
import { ConfirmationDialog } from "./confirmation-dialog";
import type { MetaCourse } from "~/services/sanity/types";

export function Course({
  course,
  inCatalog,
}: {
  course: MetaCourse;
  inCatalog: boolean;
}) {
  const courseWithType = { ...course, type: "course" as const };
  return (
    <TableRow>
      <TableCell>{capitalizeFirstLetter(course.title)}</TableCell>
      <TableCell className="flex items-center justify-end">
        <ConfirmationDialog item={courseWithType} inCatalog={inCatalog} />
      </TableCell>
    </TableRow>
  );
}
