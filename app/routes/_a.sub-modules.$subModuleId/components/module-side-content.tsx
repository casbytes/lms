import React from "react";
import { Await } from "@remix-run/react";
import { CourseTitle } from "~/components/course-title";
import { PendingStatus, Status } from "~/components/status";
import { capitalizeFirstLetter } from "~/utils/cs";
import { Lessons } from "./lessons";
import { ILessonProgress, ISubModuleProgress } from "~/constants/types";

type ModuleSideContentProps = {
  lessons: Promise<ILessonProgress[]>;
  subModule: ISubModuleProgress | null;
};

export function ModuleSideContent({
  lessons,
  subModule,
}: ModuleSideContentProps) {
  return (
    <>
      {subModule ? (
        <CourseTitle title={capitalizeFirstLetter(subModule.title)} />
      ) : null}
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
      {Array(10).map((_, i) => (
        <li key={i} className="bg-gray-300 h-8 rounded-md animate-pulse" />
      ))}
    </ul>
  );
}
