import React from "react";
import { Course as ICourse } from "~/utils/db.server";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { UserCourse } from "./user-course";
import { Await } from "@remix-run/react";
import { PendingCard } from "./pending-card";

type CCCProps = {
  userCourses: Promise<ICourse[]>;
};

export function UserCourses({ userCourses }: CCCProps) {
  return (
    <div className="rounded-md bg-zinc-300/30 p-2 flex flex-col items-center shadow-lg">
      <React.Suspense fallback={<PendingCard />}>
        <Await resolve={userCourses}>
          {(userCourses) => (
            <>
              <h2 className="text-lg font-bold">My courses</h2>
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
            </>
          )}
        </Await>
      </React.Suspense>
    </div>
  );
}
