import { Table, TableBody, TableCell, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { CircleCheckBig, CircleDotDashed } from "lucide-react";
import { BiReset } from "react-icons/bi";
import { Link } from "@remix-run/react";

export function CourseCatalogCard() {
  return (
    <div className="rounded-md bg-teal-300/30 p-6 flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4 text-teal-600">Course catalog</h2>
      <Table>
        <TableBody className="text-slate-600 text-lg">
          <TableRow>
            <TableCell className="text-blue-700">
              <Link to="/courses/1">Frontend development</Link>
            </TableCell>

            <TableCell className="flex gap-4 items-center justify-end">
              <span className="text-sm"> 100%</span>{" "}
              <Link to="/courses/1">
                <Button
                  className="bg-teal-500 hover:bg-teal-400 py-1 font-black"
                  size="icon"
                >
                  <CircleCheckBig size={20} />
                </Button>
              </Link>
              <Button
                className="bg-red-400 hover:bg-red-300 py-1 font-black"
                size="icon"
              >
                <BiReset size={20} />
              </Button>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Software design and architecture</TableCell>
            <TableCell className="flex gap-4 items-center justify-end text-right">
              <span className="text-sm">30%</span>{" "}
              <Button
                className="bg-teal-500 hover:bg-teal-400 py-1 font-black"
                size="icon"
              >
                <CircleDotDashed size={20} />
              </Button>
              <Button
                className="bg-red-400 hover:bg-red-300 py-1 font-black"
                size="icon"
              >
                <BiReset size={20} />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      {/* <p className="text-lg text-center text-slate-600 bg-teal-300/60 p-2 rounded-md">
        No courses in your catalog.
        <br />
        <span className="text-sm">Add a course to your catalog to begin.</span>
      </p> */}
    </div>
  );
}
