import React from "react";
import { Await } from "@remix-run/react";
import { ImSpinner2 } from "react-icons/im";
import { ICourse } from "~/constants/types";
import { CoursesCard } from "./courses-card";

type CoursesProps = {
  data: Promise<{ courses: ICourse[]; inCatalog: boolean }>;
};

export function Courses({ data }: CoursesProps) {
  return (
    <React.Suspense fallback={<PendingCard />}>
      <Await resolve={data}>{(data) => <CoursesCard data={data} />}</Await>
    </React.Suspense>
  );
}

function PendingCard() {
  return (
    <div className="w-full flex items-center justify-center p-20 bg-indigo-300/30 rounded-md">
      <ImSpinner2 size={50} className="animate-spin text-slate-600 " />
    </div>
  );
}
