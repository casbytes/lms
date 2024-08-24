import React from "react";
import { Await } from "@remix-run/react";
import { User } from "~/utils/db.server";
import { PendingCard } from "./pending-card";
import { Module } from "./module";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { capitalizeFirstLetter } from "~/utils/helpers";
import { ModuleSearchInput } from "./module-search-input";
import { ConfirmationDialog } from "./confirmation-dialog";
import { Separator } from "~/components/ui/separator";
import type { MetaModule } from "~/services/sanity/types";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

type ModulesProps = {
  user: User;
  moduleData: Promise<{ modules: MetaModule[]; inCatalog: boolean }>;
};

export function Modules({ moduleData, user }: ModulesProps) {
  return (
    <React.Suspense fallback={<PendingCard />}>
      <Await resolve={moduleData}>
        {(moduleData) => {
          const { inCatalog, modules } = moduleData;

          return (
            <Dialog>
              <Card className="shadow-lg">
                <CardHeader className="py-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="font-mono">Modules</CardTitle>
                    {modules?.length ? (
                      <Button size={"sm"} variant={"ghost"} asChild>
                        <DialogTrigger className="self-end">
                          View All
                        </DialogTrigger>
                      </Button>
                    ) : null}
                  </div>
                </CardHeader>
                <Separator className="mb-2" />
                <CardContent>
                  <ul className="space-y-1">
                    {modules?.length ? (
                      modules.slice(0, 5).map((module, index: number) => (
                        <li
                          key={module.id}
                          className="flex justify-between text-sm"
                        >
                          {index + 1}. {capitalizeFirstLetter(module.title)}
                          <div>
                            <ConfirmationDialog
                              item={{ ...module, type: "module" as const }}
                              user={user}
                              inCatalog={inCatalog}
                            />
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="text-center text-sm text-slate-500 mt-4">
                        No modules found.
                        <br />
                        Try again.
                      </li>
                    )}
                  </ul>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-scroll">
                    <DialogTitle>Modules</DialogTitle>
                    <ModuleSearchInput searchValue="module" />
                    {modules?.length ? (
                      modules.map((module) => (
                        <Module
                          module={module}
                          key={module.id}
                          user={user}
                          inCatalog={inCatalog}
                        />
                      ))
                    ) : (
                      <p className="text-center text-sm text-slate-500 mt-4">
                        No modules match your term.
                        <br />
                        Try again.
                      </p>
                    )}
                  </DialogContent>
                </CardContent>
              </Card>
            </Dialog>
          );
        }}
      </Await>
    </React.Suspense>
  );
}
