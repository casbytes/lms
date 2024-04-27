import React from "react";
import { Await } from "@remix-run/react";
import { CourseTitle } from "~/components/course-title";
import { Modules } from "./modules";
import { PendingStatus, Status } from "~/components/status";
import { TrophyCarbinet } from "./trophy-carbinet";
import { Project } from "./project";
import { Separator } from "~/components/ui/separator";

export function CourseSideContent({ modules }: any) {
  return (
    <>
      <CourseTitle title="Trophy cabinet" />
      <TrophyCarbinet />
      <CourseTitle title="Modules" />
      <div className="flex flex-col gap-4">
        <React.Suspense fallback={<PendingStatus />}>
          <Await resolve={modules}>
            {(modules) => <Status status={modules} />}
          </Await>
        </React.Suspense>

        <Separator className="bg-sky-700 h-2 rounded-tl-md rounded-br-md" />

        <React.Suspense fallback={<PendingModules />}>
          <Await resolve={modules}>
            {(modules) => <Project modules={modules} />}
          </Await>
        </React.Suspense>

        <Separator className="bg-sky-700 h-2 rounded-tl-md rounded-br-md" />

        <React.Suspense fallback={<PendingModules />}>
          <Await resolve={modules}>
            {(modules) => <Modules modules={modules} />}
          </Await>
        </React.Suspense>
      </div>
    </>
  );
}

function PendingModules() {
  return (
    <ul className="space-y-3">
      {Array(10).map((_, i) => (
        <li key={i} className="bg-gray-300 h-8 rounded-md animate-pulse"></li>
      ))}
    </ul>
  );
}
