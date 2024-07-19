import React from "react";
import { Await } from "@remix-run/react";
import { ImSpinner2 } from "react-icons/im";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Chart } from "./chart";
import { Courses, Modules } from "~/routes/_a.dashboard/components/catalog";
import type { CourseProgress, ModuleProgress } from "~/utils/db.server";
import { ChartFilter } from "./chart-filter";

type Data = {
  date: string;
  hours: number;
}[];

type StatisticsProps = {
  timeData: Promise<Data>;
  userCourses: Promise<CourseProgress[]>;
  userModules: Promise<ModuleProgress[]>;
};

export function Statistics({
  userCourses,
  userModules,
  timeData,
}: StatisticsProps) {
  return (
    <Tabs defaultValue="catalog">
      <TabsList className="w-full flex flex-wrap bg-inherit justify-start mb-12">
        <TabsTrigger value="catalog" className="text-xl">
          My courses
        </TabsTrigger>
        <TabsTrigger value="modules" className="text-xl">
          My modules
        </TabsTrigger>
        <TabsTrigger value="chart" className="text-xl">
          Learning hours
        </TabsTrigger>
      </TabsList>
      <React.Suspense fallback={<PendingCard />}>
        <TabsContent value="catalog" className="max-h-full">
          <Await resolve={userCourses}>
            {(userCourses) => <Courses userCourses={userCourses} />}
          </Await>
        </TabsContent>
        <TabsContent value="modules" className="max-h-full">
          <Await resolve={userModules}>
            {(userModules) => <Modules userModules={userModules} />}
          </Await>
        </TabsContent>
        <TabsContent value="chart" className="w-full">
          <div className="flex flex-col">
            <ChartFilter />
            <Await resolve={timeData}>
              {(timeData) => <Chart timeData={timeData} />}
            </Await>
          </div>
        </TabsContent>
      </React.Suspense>
    </Tabs>
  );
}

function PendingCard() {
  return (
    <div className="w-full flex items-center justify-center p-20 bg-slate-400/50 rounded-md">
      <ImSpinner2 size={50} className="animate-spin text-slate-600 " />
    </div>
  );
}
