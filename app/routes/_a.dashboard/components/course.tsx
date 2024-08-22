import { TableCell, TableRow } from "~/components/ui/table";
import { capitalizeFirstLetter } from "~/utils/helpers";
import { ConfirmationDialog } from "./confirmation-dialog";
import { GithubCourse } from "../utils.server";

export function Course({
  course,
  inCatalog,
}: {
  course: GithubCourse;
  inCatalog: boolean;
}) {
  const courseWithType = { ...course, type: "course" as const };
  return (
    <TableRow>
      <TableCell>{capitalizeFirstLetter(course.title)}</TableCell>
      <TableCell className="flex gap-6 items-center justify-end">
        <ConfirmationDialog item={courseWithType} inCatalog={inCatalog} />
      </TableCell>
    </TableRow>
  );
}
