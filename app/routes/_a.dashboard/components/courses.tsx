import React from "react";
import { Await } from "@remix-run/react";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { type GithubCourse } from "../utils.server";
import { Course } from "./course";
import { PendingCard } from "./pending-card";

type CoursesProps = {
  courseData: Promise<{ courses: GithubCourse[]; inCatalog: boolean }>;
};

export function Courses({ courseData }: CoursesProps) {
  return (
    <React.Suspense fallback={<PendingCard />}>
      <Await resolve={courseData}>
        {(courseData) => {
          const { inCatalog, courses } = courseData;
          return (
            <div className="rounded-md bg-slate-300/30 p-2 flex flex-col items-center h-full shadow-lg">
              <h2 className="text-lg font-bold">Courses</h2>
              <Table>
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
          );
        }}
      </Await>
    </React.Suspense>
  );
}
