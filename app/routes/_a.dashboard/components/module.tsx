import { TableCell, TableRow } from "~/components/ui/table";
import { capitalizeFirstLetter } from "~/utils/helpers";
import { ConfirmationDialog } from "./confirmation-dialog";
import type { User } from "~/utils/db.server";
import type { GithubModule } from "../utils.server";

export function Module({
  user,
  module,
  inCatalog,
}: {
  user: User;
  module: GithubModule;
  inCatalog: boolean;
}) {
  const moduleWithType = { ...module, type: "module" as const };
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
