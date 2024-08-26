import React from "react";
import { Course as ICourse } from "~/utils/db.server";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { UserCourse } from "./user-course";
import { Await } from "@remix-run/react";
import { PendingCard } from "./pending-card";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

type CCCProps = {
  userCourses: Promise<ICourse[]>;
};

export function UserCourses({ userCourses }: CCCProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="py-4">
        <CardTitle className="font-mono">My courses</CardTitle>
      </CardHeader>
      <Separator />
      <React.Suspense fallback={<PendingCard />}>
        <Await resolve={userCourses}>
          {(userCourses) => (
            <CardContent>
              <Table>
                <TableBody className="text-slate-600">
                  {userCourses && userCourses?.length ? (
                    userCourses.map((course, index) => (
                      <UserCourse
                        course={course}
                        key={`${course.id}-${index}`}
                      />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="text-center text-sm text-slate-500"
                      >
                        No courses in your catalog.
                        <br />
                        <span className="text-sm">
                          Add a course to your catalog to begin your journey.
                        </span>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          )}
        </Await>
      </React.Suspense>
    </Card>
  );
}
