import React from "react";
import { Await } from "@remix-run/react";
import { CourseTitle } from "~/components/course-title";
import { PendingStatus, Status } from "~/components/status";
import { Lessons } from "./lessons";
import type { Lesson } from "~/utils/db.server";

type ModuleSideContentProps = {
  lessons: Promise<Lesson[]>;
};

export function ModuleSideContent({ lessons }: ModuleSideContentProps) {
  return (
    <>
      <CourseTitle title="Lessons" />
      <React.Suspense fallback={<PendingStatus />}>
        <Await resolve={lessons}>
          {(lessons) => <Status status={lessons} />}
        </Await>
      </React.Suspense>

      <React.Suspense fallback={<PendingLessons />}>
        <Await resolve={lessons}>
          {(lessons) => <Lessons lessons={lessons} />}
        </Await>
      </React.Suspense>
    </>
  );
}

function PendingLessons() {
  return (
    <ul className="space-y-3">
      {Array.from({ length: 10 }, (_, i) => (
        <li key={i} className="bg-gray-300 h-8 rounded-md animate-pulse" />
      ))}
    </ul>
  );
}
