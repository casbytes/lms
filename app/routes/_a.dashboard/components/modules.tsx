import React from "react";
import { Await } from "@remix-run/react";
import { ImSpinner2 } from "react-icons/im";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Module } from "./module";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { capitalizeFirstLetter } from "~/utils/helpers";
import type { Course, Module as IModule } from "../utils.server";
import { User } from "~/utils/db.server";

type CourseWithModules = Course & {
  modules: IModule[];
};

type ModulesProps = {
  user: User;
  courseData: Promise<{ courses: CourseWithModules[]; inCatalog: boolean }>;
};

export function Modules({ courseData, user }: ModulesProps) {
  return (
    <React.Suspense fallback={<PendingCard />}>
      <Await resolve={courseData}>
        {(courseData) => (
          <div>
            <div className="rounded-md bg-cyan-300/30 p-6 flex flex-col items-center">
              <h2 className="text-xl font-bold mb-4 text-cyan-600">Modules</h2>
              <Dialog>
                <div className="w-full">
                  <Button className="w-full" asChild>
                    <DialogTrigger className="w-full bg-cyan-600 hover:bg-cyan-500">
                      View Modules
                    </DialogTrigger>
                  </Button>
                  <p className="mt-2 max-w-xs text-center mx-auto text-slate-600 text-sm">
                    Click the button above to view all modules.
                  </p>
                </div>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-scroll">
                  <DialogTitle>Courses</DialogTitle>
                  <Accordion type="single" collapsible>
                    {courseData.courses && courseData.courses?.length ? (
                      courseData.courses.map((course) => (
                        <AccordionItem value={course.title!} key={course.id}>
                          <AccordionTrigger className="text-lg">
                            {capitalizeFirstLetter(course.title!)}
                          </AccordionTrigger>
                          <AccordionContent>
                            <Table>
                              <TableHeader>
                                <TableRow className="w-full">
                                  <TableHead>Module Title</TableHead>
                                  <TableHead className="flex gap-6 items-center justify-end">
                                    {/* 🤷‍♂️  */}
                                    Add to catalog
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody className="text-slate-600 font-black">
                                {course.modules?.length ? (
                                  course.modules.map((module) => (
                                    <Module
                                      user={user}
                                      key={module.id}
                                      module={module}
                                      inCatalog={courseData.inCatalog}
                                    />
                                  ))
                                ) : (
                                  <TableRow>
                                    <TableCell colSpan={2}>
                                      No modules available
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </AccordionContent>
                        </AccordionItem>
                      ))
                    ) : (
                      <p>No courses available</p>
                    )}
                  </Accordion>
                  <DialogFooter>
                    <Button variant={"outline"} asChild>
                      <DialogTrigger>Close</DialogTrigger>
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </Await>
    </React.Suspense>
  );
}

function PendingCard() {
  return (
    <div className="w-full flex items-center justify-center p-16 bg-indigo-200/30 rounded-md">
      <ImSpinner2 size={50} className="animate-spin text-slate-600 " />
    </div>
  );
}
