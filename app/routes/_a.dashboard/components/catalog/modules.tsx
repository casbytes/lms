import type { ModuleProgress, CourseProgress } from "~/utils/db.server";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { Module } from "./module";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import React from "react";

type ModuleWithCourse = ModuleProgress & {
  courseProgress?: CourseProgress;
};

type ModulesProps = {
  userModules: ModuleWithCourse[];
};

export function Modules({ userModules }: ModulesProps) {
  /**
   * Group modules by course title if available, and use accordion to render
   * modules under each course title. If no course title is available, render
   * the modules without grouping using the ModuleTable component.
   */
  const groupedModules = React.useMemo(() => {
    return userModules.reduce(
      (acc: Record<string, ModuleWithCourse[]>, module) => {
        const courseTitle = module?.courseProgress?.title ?? "no-title";
        if (!acc[courseTitle]) {
          acc[courseTitle] = [];
        }
        acc[courseTitle].push(module);
        return acc;
      },
      {}
    );
  }, [userModules]);

  return (
    <div className="rounded-md bg-emerald-300/30 p-6 flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4 text-emerald-600">
        Module catalog
      </h2>

      {userModules?.length ? (
        <Dialog>
          <div className="w-full">
            <Button className="w-full" asChild>
              <DialogTrigger className="w-full bg-emerald-600 hover:bg-emerald-500">
                View My Modules
              </DialogTrigger>
            </Button>
            <p className="mt-2 max-w-xs text-center mx-auto text-slate-600 text-sm">
              Click the button above to view all modules in your catalog,
              including individual modules associated with no course.
            </p>
          </div>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-scroll">
            <DialogTitle>My modules</DialogTitle>
            <Accordion type="single" collapsible>
              {Object.entries(groupedModules).map(
                ([courseTitle, modules], index: number) =>
                  courseTitle !== "no-title" ? (
                    <AccordionItem key={courseTitle} value={courseTitle}>
                      <AccordionTrigger className="text-lg">
                        {courseTitle}
                      </AccordionTrigger>
                      <AccordionContent>
                        <ModuleTable userModules={modules} />
                      </AccordionContent>
                    </AccordionItem>
                  ) : (
                    <ModuleTable key={index} userModules={modules} />
                  )
              )}
            </Accordion>
          </DialogContent>
        </Dialog>
      ) : (
        <p className="text-slate-600 max-w-md text-center">
          No courses in your catalog.
          <br />
          <span className="text-sm">
            Add a course to your catalog to begin your journey.
          </span>
        </p>
      )}
    </div>
  );
}

function ModuleTable({ userModules }: { userModules: ModuleProgress[] }) {
  return (
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
  );
}
