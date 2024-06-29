import React from "react";
import { types } from "~/utils/db.server";
import { Await } from "@remix-run/react";
import { CourseTitle } from "~/components/course-title";
import { PendingStatus, Status } from "~/components/status";
import { Separator } from "~/components/ui/separator";
import { BadgeGallery, Module } from "~/components/modules";

type CourseSideContentProps = {
  user: types.User;
  module: Promise<types.ModuleProgress>;
  moduleBadges: Promise<types.Badge[]>;
};

export function SideContent({
  user,
  module,
  moduleBadges,
}: CourseSideContentProps) {
  return (
    <>
      <CourseTitle title="Module Badge Gallery" />
      <React.Suspense fallback={<PendingBadges />}>
        <Await resolve={moduleBadges}>
          {(moduleBadges) => <BadgeGallery badges={moduleBadges} />}
        </Await>
      </React.Suspense>
      <CourseTitle title="Modules" />
      <div className="flex flex-col gap-4">
        <React.Suspense fallback={<PendingStatus />}>
          <Await resolve={module}>
            {(module) => <Status status={[module]} />}
          </Await>
        </React.Suspense>

        <Separator className="bg-sky-700 h-2 rounded-tl-md rounded-br-md" />
        <React.Suspense fallback={<PendingModule />}>
          <Await resolve={module}>
            {(module) => (
              <ul className="space-y-3">
                {module ? (
                  <Module module={module} user={user} />
                ) : (
                  <li className="text-center text-lg my-4">
                    No submodule with given ID.
                  </li>
                )}
              </ul>
            )}
          </Await>
        </React.Suspense>
      </div>
    </>
  );
}

function PendingBadges() {
  return (
    <div className="flex gap-4 m-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-8 bg-slate-400 rounded-md w-full animate-pulse"
        />
      ))}
    </div>
  );
}

function PendingModule() {
  return (
    <ul className="space-y-3">
      <li className="bg-gray-300 h-8 rounded-md animate-pulse"></li>
    </ul>
  );
}
