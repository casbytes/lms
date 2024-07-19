import { TableCell, TableRow } from "~/components/ui/table";
import { capitalizeFirstLetter } from "~/utils/helpers";
import { ConfirmationDialog } from "./confirmation-dialog";
import type { User } from "~/utils/db.server";
import type { Module } from "../utils.server";

export function Module({
  user,
  module,
  inCatalog,
}: {
  user: User;
  module: Module;
  inCatalog: boolean;
}) {
  const moduleWithType = { ...module, type: "module" as const };
  return (
    <TableRow className="w-full">
      <TableCell>{capitalizeFirstLetter(module.title)}</TableCell>
      <TableCell className="flex gap-6 items-center justify-end">
        <ConfirmationDialog
          user={user}
          item={moduleWithType}
          inCatalog={inCatalog}
        />
      </TableCell>
    </TableRow>
  );
}
