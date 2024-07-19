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
import { type Course as ICourse } from "../utils.server";
import { Course } from "./course";

type CoursesProps = {
  data: Promise<{ courses: ICourse[]; inCatalog: boolean }>;
};

export function Courses({ data }: CoursesProps) {
  return (
    <React.Suspense fallback={<PendingCard />}>
      <Await resolve={data}>
        {(data) => {
          const { inCatalog, courses } = data;
          return (
            <div>
              <div className="rounded-md bg-indigo-300/30 p-6 flex flex-col items-center">
                <h2 className="text-xl font-bold mb-4 text-indigo-600">
                  Courses
                </h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Title</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-slate-600 font-black">
                    {courses && courses?.length ? (
                      courses.map((course, index) => (
                        <Course
                          course={course}
                          inCatalog={inCatalog}
                          key={`${course.id}-${index}`}
                        />
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2}>No courses available</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          );
        }}
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
