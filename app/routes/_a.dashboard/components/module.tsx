import { TableCell, TableRow } from "~/components/ui/table";
import { capitalizeFirstLetter } from "~/utils/helpers";
import { ConfirmationDialog } from "./confirmation-dialog";
import type { User } from "~/utils/db.server";
import type { MetaModule } from "~/services/sanity/types";

export function Module({
  user,
  module,
  inCatalog,
}: {
  user: User;
  module: MetaModule;
  inCatalog: boolean;
}) {
  const moduleWithType = { ...module, type: "module" as const };
  console.log("yo");
  return (
    <TableRow className="w-full flex justify-between">
      <TableCell>{capitalizeFirstLetter(module.title)}</TableCell>
      <TableCell>
        <ConfirmationDialog
          user={user}
          item={moduleWithType}
          inCatalog={inCatalog}
        />
      </TableCell>
    </TableRow>
  );
}
