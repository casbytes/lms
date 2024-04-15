import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { FaPlus, FaSpinner } from "react-icons/fa6";

export function CoursesCard() {
  return (
    <div>
      <h1 className="text-xl mb-4">Courses</h1>
      <Input
        placeholder="search courses"
        type="search"
        id="search"
        name="search"
        className="mb-4"
      />
      <div className="rounded-md bg-indigo-300/30 p-6 flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4 text-indigo-600">Courses</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Title</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-slate-600 font-black">
            <TableRow>
              <TableCell>Frontend development with javascript</TableCell>
              <TableCell className="flex gap-6 items-center justify-end">
                <Button
                  className="bg-indigo-500 hover:bg-indigo-400 py-1 font-black"
                  size="sm"
                >
                  <FaPlus className="mr-2" />
                  {/* <FaSpinner className="mr-2 animate-spin" /> */}
                  Add to catalog
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Backend development with javascript</TableCell>
              <TableCell className="flex gap-6 items-center justify-end">
                <Button
                  className="bg-indigo-500 hover:bg-indigo-400 py-1 font-black text-xs"
                  size="sm"
                >
                  <FaPlus className="mr-2" />
                  Add to catalog
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fullstack development with javascript</TableCell>
              <TableCell className="flex gap-6 items-center justify-end">
                <Button
                  className="bg-indigo-500 hover:bg-indigo-400 py-1 font-black text-xs"
                  size="sm"
                  disabled
                >
                  <FaPlus className="mr-2" />
                  {/* <FaSpinner className="mr-2 animate-spin" /> */}
                  Add to catalog
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
