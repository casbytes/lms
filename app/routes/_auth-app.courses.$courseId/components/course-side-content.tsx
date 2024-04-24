import React from "react";
import { CourseTitle } from "~/components/course-title";
import { Courses } from "./courses";
import { PendingStatus, Status } from "~/components/status";
import { TrophyCarbinet } from "./trophy-carbinet";
import { Await } from "@remix-run/react";

export function CourseSideContent({ modules }: any) {
  return (
    <>
      <CourseTitle title="Trophy cabinet" />
      <TrophyCarbinet />
      <CourseTitle title="Modules" />
      <div className="flex flex-col gap-8">
        <React.Suspense fallback={<PendingStatus />}>
          <Await resolve={modules}>
            {(modules) => <Status status={modules} />}
          </Await>
        </React.Suspense>

        <React.Suspense fallback={<div>Loading...</div>}>
          <Await resolve={modules}>
            {(modules) => <Courses modules={modules} />}
          </Await>
        </React.Suspense>
      </div>
    </>
  );
}
