import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { User } from "~/utils/db.server";
import { SearchInput } from "./search-input";
import { Pagination } from "./pagination";
import { Filter } from "./filter";
import { UserDialog } from "./user-dialog";
import { Badge } from "~/components/ui/badge";

export type UserTableProps = {
  pageData: {
    users: User[];
    currentTotalUsers: number;
    pageSize: number;
    currentPage: number;
    rowsPerPage: number;
    totalPages: number;
  };
  totalUsers?: number;
};

export function UserTable({ totalUsers, pageData }: UserTableProps) {
  const { users, currentTotalUsers } = pageData;
  return (
    <div className="mt-12">
      <div className="flex flex-wrap md:flex-nowrap gap-4 mb-4 items-center">
        <SearchInput />
        <Filter />
        <Pagination pageData={pageData} />
      </div>

      <Table className="bg-zinc-100 border-2">
        <TableCaption>
          {currentTotalUsers} of {totalUsers} Users
        </TableCaption>
        <TableHeader className="text-lg">
          <TableRow>
            <TableHead>Name:</TableHead>
            <TableHead>Email:</TableHead>
            <TableHead>Role:</TableHead>
            <TableHead>🤷‍♂️</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.length ? (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge>{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <UserDialog user={user} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4}>
                <span className="text-center block">No users found</span>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
