import React from "react";
import { Await } from "@remix-run/react";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { Course } from "./course";
import { PendingCard } from "./pending-card";
import type { MetaCourse } from "~/services/sanity/types";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

type CoursesProps = {
  courseData: Promise<{ courses: MetaCourse[]; inCatalog: boolean }>;
};

export function Courses({ courseData }: CoursesProps) {
  return (
    <React.Suspense fallback={<PendingCard />}>
      <Await resolve={courseData}>
        {(courseData) => {
          const { inCatalog, courses } = courseData;
          return (
            <Card className="shadow-lg">
              <CardHeader className="py-4">
                <CardTitle className="font-mono">Courses</CardTitle>
              </CardHeader>
              <Separator />
              <CardContent>
                <Table>
                  <TableBody className="text-slate-600 font-black text-sm">
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
              </CardContent>
            </Card>
          );
        }}
      </Await>
    </React.Suspense>
  );
}
