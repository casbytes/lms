import React from "react";
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
import { Await, Link } from "@remix-run/react";
import { PendingCard } from "./pending-card";
import { capitalizeFirstLetter, STATUS } from "~/utils/helpers";
import { FaRegEye } from "react-icons/fa6";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { Separator } from "~/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ModuleSearchInput } from "~/components/search-input";

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
    <React.Suspense fallback={<PendingCard />}>
      <Await resolve={userModules}>
        {(userModules) => <Modules userModules={userModules} />}
      </Await>
    </React.Suspense>
  );
}

function Modules({ userModules }: ModulesProps) {
  return (
    <Dialog>
      <Card className="shadow-lg">
        <CardHeader className="py-2">
          <div className="flex justify-between items-center">
            <CardTitle className="font-mono">My modules</CardTitle>
            {userModules?.length ? (
              <Button
                size={"sm"}
                variant={"ghost"}
                className="self-end"
                asChild
              >
                <DialogTrigger>View All</DialogTrigger>
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <Separator />
        <CardContent>
          <ul className="-space-y-2">
            {userModules?.length ? (
              userModules.slice(0, 6).map((module, index: number) => (
                <li
                  key={module.id}
                  className="flex justify-between items-center text-sm"
                >
                  {index + 1}. {capitalizeFirstLetter(module.title)}
                  <div className="flex items-center gap-2">
                    <span className=" text-sky-600"> {module.score}%</span>{" "}
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
                        itemType="module"
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
        </CardContent>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-scroll">
          <DialogTitle>My modules</DialogTitle>
          <ModuleTable userModules={userModules} />
        </DialogContent>
      </Card>
    </Dialog>
  );
}

function ModuleTable({ userModules }: { userModules: IModule[] }) {
  return (
    <Table>
      <TableBody className="text-slate-600 text-lg">
        <TableRow>
          <TableCell colSpan={2}>
            <ModuleSearchInput
              searchValue="userModule"
              placeholder="search modules"
            />
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
