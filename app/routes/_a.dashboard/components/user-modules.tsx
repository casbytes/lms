import type { Module as IModule, Course } from "~/utils/db.server";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { UserModule } from "./user-module";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import React from "react";
import { Await, Link } from "@remix-run/react";
import { PendingCard } from "./pending-card";
import { capitalizeFirstLetter, STATUS } from "~/utils/helpers";
import { ModuleSearchInput } from "./module-search-input";
import { FaRegEye } from "react-icons/fa6";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { Separator } from "~/components/ui/separator";

type ModuleWithCourse = IModule & {
  course?: Course;
};

type ModulesProps = {
  userModules: ModuleWithCourse[];
};

export function UserModules({
  userModules,
}: {
  userModules: Promise<ModuleWithCourse[]>;
}) {
  return (
    <div className="rounded-md bg-slate-300/30 p-2 px-4 flex flex-col items-center shadow-lg">
      <React.Suspense fallback={<PendingCard />}>
        <Await resolve={userModules}>
          {(userModules) => <Modules userModules={userModules} />}
        </Await>
      </React.Suspense>
    </div>
  );
}

function Modules({ userModules }: ModulesProps) {
  return (
    <Dialog>
      <div className="w-full flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <DialogTitle className="text-zinc-600">My modules</DialogTitle>
          {userModules?.length ? (
            <Button
              size={"sm"}
              variant={"secondary"}
              className="self-end"
              asChild
            >
              <DialogTrigger>View All</DialogTrigger>
            </Button>
          ) : null}
        </div>
        <Separator />
        <ul className="-space-y-2">
          {userModules?.length ? (
            userModules.slice(0, 6).map((module, index: number) => (
              <li
                key={module.id}
                className="flex justify-between items-center text-sm"
              >
                {index + 1}. {capitalizeFirstLetter(module.title)}
                <div>
                  <Button
                    size="sm"
                    variant={"ghost"}
                    className="!p-0 !m-0 font-black text-sky-600"
                    disabled={module.status === STATUS.LOCKED}
                  >
                    <Link prefetch="intent" to={`/modules/${module.id}`}>
                      <FaRegEye size={15} />
                    </Link>
                  </Button>
                  {!module.courseId ? (
                    <DeleteConfirmationDialog
                      title={module.title}
                      itemId={module.id}
                      itemType="course"
                    />
                  ) : null}
                </div>
              </li>
            ))
          ) : (
            <li className="text-center text-sm text-slate-500 mt-4">
              No modules in your catalog.
              <br />
              Add a module to your catalog to begin.
            </li>
          )}
        </ul>
      </div>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-scroll">
        <DialogTitle>My modules</DialogTitle>
        <ModuleTable userModules={userModules} />
      </DialogContent>
    </Dialog>
  );
}

function ModuleTable({ userModules }: { userModules: IModule[] }) {
  return (
    <Table>
      <TableBody className="text-slate-600 text-lg">
        <TableRow>
          <TableCell colSpan={2}>
            <ModuleSearchInput searchValue="userModule" />
          </TableCell>
        </TableRow>
        {userModules?.length ? (
          userModules.map((module, index) => (
            <UserModule module={module} key={`${module.id}-${index}`} />
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
  );
}
