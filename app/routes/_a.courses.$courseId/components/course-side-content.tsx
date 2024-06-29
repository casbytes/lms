import React from "react";
import { types } from "~/utils/db.server";
import { Await } from "@remix-run/react";
import { CourseTitle } from "~/components/course-title";
import { PendingStatus, Status } from "~/components/status";
import { Project } from "./project";
import { Separator } from "~/components/ui/separator";
import { BadgeGallery, Modules } from "~/components/modules";

type CourseSideContentProps = {
  user: types.User;
  project: types.Project;
  modules: Promise<types.ModuleProgress[]>;
  badges: Promise<types.Badge[]>;
};

export function CourseSideContent({
  user,
  project,
  modules,
  badges,
}: CourseSideContentProps) {
  return (
    <>
      <CourseTitle title="Module Badge Gallery" />
      <React.Suspense fallback={<PendingBadges />}>
        <Await resolve={badges}>
          {(badges) => <BadgeGallery badges={badges} />}
        </Await>
      </React.Suspense>
      <CourseTitle title="Modules" />
      <div className="flex flex-col gap-4">
        <React.Suspense fallback={<PendingStatus />}>
          <Await resolve={modules}>
            {(modules) => <Status status={modules} />}
          </Await>
        </React.Suspense>

        <Separator className="bg-sky-700 h-2 rounded-tl-md rounded-br-md" />
        <Project project={project} user={user} />
        <Separator className="bg-sky-700 h-2 rounded-tl-md rounded-br-md" />

        <React.Suspense fallback={<PendingModules />}>
          <Await resolve={modules}>
            {(modules) => <Modules modules={modules} user={user} />}
          </Await>
        </React.Suspense>
      </div>
    </>
  );
}

function PendingBadges() {
  return (
    <div className="flex gap-4 m-2">
      {Array(4).map((_, i) => (
        <div
          key={i}
          className="h-8 bg-slate-400 rounded-md w-full animate-pulse"
        />
      ))}
    </div>
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
