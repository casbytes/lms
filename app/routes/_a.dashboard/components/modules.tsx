import React from "react";
import { Await } from "@remix-run/react";
import type { GithubModule } from "../utils.server";
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

type ModulesProps = {
  user: User;
  moduleData: Promise<{ modules: GithubModule[]; inCatalog: boolean }>;
};

export function Modules({ moduleData, user }: ModulesProps) {
  return (
    <React.Suspense fallback={<PendingCard />}>
      <Await resolve={moduleData}>
        {(moduleData) => {
          const { inCatalog, modules } = moduleData;

          return (
            <div>
              <div className="rounded-md bg-slate-300/30 p-2 h-full flex flex-col items-center shadow-lg">
                <Dialog>
                  <div className="w-full flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <DialogTitle>Modules</DialogTitle>
                      {modules?.length ? (
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
                    <Separator className="mb-2" />
                    <ul className="space-y-1">
                      {modules?.length ? (
                        modules.slice(0, 6).map((module, index: number) => (
                          <li
                            key={module.id}
                            className="flex justify-between text-sm"
                          >
                            {index + 1}. {capitalizeFirstLetter(module.title)}
                            <div>
                              <ConfirmationDialog
                                item={{ ...module, type: "module" as const }}
                                inCatalog={inCatalog}
                              />
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
                        No modules in your catalog.
                        <br />
                        Add a module to your catalog to begin.
                      </p>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          );
        }}
      </Await>
    </React.Suspense>
  );
}
