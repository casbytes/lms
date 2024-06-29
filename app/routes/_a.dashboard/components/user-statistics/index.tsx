import React from "react";
import type { ICourseProgress, IModuleProgress } from "~/constants/types";
import { Await } from "@remix-run/react";
import { ImSpinner2 } from "react-icons/im";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Chart } from "./chart";
import { Courses } from "~/components/catalog";
import { Modules } from "~/components/catalog";

type StatisticsProps = {
  userCourses: Promise<ICourseProgress[]>;
  userModules: Promise<IModuleProgress[]>;
};

export function Statistics({ userCourses, userModules }: StatisticsProps) {
  return (
    <Tabs defaultValue="catalog">
      <TabsList className="w-full flex bg-inherit justify-start mb-6">
        <div className="flex flex-wrap justify-between items-center w-full">
          <div>
            <TabsTrigger value="catalog" className="text-xl">
              My courses
            </TabsTrigger>
            <TabsTrigger value="modules" className="text-xl">
              My modules
            </TabsTrigger>
            <TabsTrigger value="chart" className="text-xl">
              Learning hours
            </TabsTrigger>
            <TabsTrigger value="progress" className="text-xl">
              Progress
            </TabsTrigger>
          </div>
          {/* {tab === "chart" ? <ChartFilter /> : null} */}
        </div>
      </TabsList>

      <TabsContent value="catalog" className="max-h-full">
        <React.Suspense fallback={<PendingCard />}>
          <Await resolve={userCourses}>
            {(userCourses) => <Courses userCourses={userCourses} />}
          </Await>
        </React.Suspense>
      </TabsContent>
      <TabsContent value="modules" className="max-h-full">
        <React.Suspense fallback={<PendingCard />}>
          <Await resolve={userModules}>
            {(userModules) => <Modules userModules={userModules} />}
          </Await>
        </React.Suspense>
      </TabsContent>
      <TabsContent value="chart" className="w-full">
        <Chart />
      </TabsContent>
      <TabsContent value="progress" className="max-h-full">
        some progress
      </TabsContent>
    </Tabs>
  );
}

function PendingCard() {
  return (
    <div className="w-full flex items-center justify-center p-20 bg-slate-300 rounded-md">
      <ImSpinner2 size={50} className="animate-spin text-slate-600 " />
    </div>
  );
}
