import { types } from "~/utils/db.server";
import { TableCell, TableRow } from "../ui/table";
import { Link } from "@remix-run/react";
import { capitalizeFirstLetter } from "~/utils/helpers";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { FaRegEye } from "react-icons/fa6";
import { Status } from "~/constants/enums";

export function Module({ module }: { module: types.ModuleProgress }) {
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

      <TableCell className="flex gap-4 items-center justify-end">
        <Badge className="text-sm mr-2"> {module.score}%</Badge>{" "}
        <Button
          size="icon"
          disabled={disabled}
          className="bg-teal-500 hover:bg-teal-400 py-1 font-black"
        >
          <Link prefetch="intent" to={`/modules/${module.id}`}>
            <FaRegEye size={20} />
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}
