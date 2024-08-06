import type { User } from "~/utils/db.server";
import { format } from "date-fns";
import { Button } from "~/components/ui/button";
import { DialogTrigger } from "~/components/ui/dialog";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { safeParseDate } from "~/utils/helpers";

type AccountDetailsProps = {
  user: User;
};

export function AccountDetails({ user }: AccountDetailsProps) {
  return (
    <div className="rounded-md bg-gray-300/50 p-6 flex flex-col justify-center items-center border border-gray-500 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Account details</h2>
      <Table>
        <TableBody className="text-lg text-slate-600">
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>{user.email}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Github username</TableCell>
            <TableCell>{user?.githubUsername ?? "🤷‍♂️"}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Joined On</TableCell>
            <TableCell className="capitalize">
              {format(safeParseDate(user.createdAt), "do MMMM, yyyy")}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Membership</TableCell>
            <TableCell>{user.subscribed ? "Premium" : "Free"}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <DialogTrigger asChild>
        <Button variant="destructive" className="capitalize mt-4">
          delete account
        </Button>
      </DialogTrigger>
    </div>
  );
}
