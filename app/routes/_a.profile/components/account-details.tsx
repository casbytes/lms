import { format } from "date-fns";
import { Button } from "~/components/ui/button";
import { DialogTrigger } from "~/components/ui/dialog";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { ICurrentUser } from "~/constants/types";

type AccountDetailsProps = {
  user: ICurrentUser;
};

export function AccountDetails({ user }: AccountDetailsProps) {
  return (
    <div className="rounded-md bg-gray-300/50 p-6 flex flex-col justify-center items-center">
      <h2 className="text-2xl font-bold mb-4">Account details</h2>
      <Table>
        <TableBody className="text-lg text-slate-600">
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>{user.email}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Sign In</TableCell>
            <TableCell className="capitalize">{user.authType}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Joined On</TableCell>
            <TableCell className="capitalize">
              {format(new Date(user.createdAt), "do MMMM, yyyy")}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Membership</TableCell>
            <TableCell>Premium</TableCell>
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
