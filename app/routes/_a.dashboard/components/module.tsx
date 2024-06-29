import type { IModule, IUser } from "~/constants/types";
import { TableCell, TableRow } from "~/components/ui/table";
import { capitalizeFirstLetter } from "~/utils/helpers";
import { ConfirmationDialog } from "./confirmation-dialog";

export function Module({
  user,
  module,
  inCatalog,
}: {
  user: IUser;
  module: IModule;
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
