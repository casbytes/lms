import type { IModuleProgress } from "~/constants/types";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import { Module } from "./module";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";

type ModulesProps = {
  userModules: IModuleProgress[];
};

export function Modules({ userModules }: ModulesProps) {
  return (
    <div className="rounded-md bg-emerald-300/30 p-6 flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4 text-emerald-600">
        Module catalog
      </h2>

      {/* <Dialog>
        <Button className="w-full" asChild>
          <DialogTrigger className="w-full bg-emerald-600 hover:bg-emerald-500">
            View My Modules
          </DialogTrigger>
        </Button>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-scroll">
          <DialogTitle>My modules</DialogTitle>
        </DialogContent>
      </Dialog> */}
      <Table>
        <TableBody className="text-slate-600 text-lg">
          {userModules && userModules?.length ? (
            userModules.map((module, index) => (
              <Module module={module} key={`${module.id}-${index}`} />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2}>
                No modules in your catalog.
                <br />
                <span className="text-sm">
                  Add a module to your catalog to begin.
                </span>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
