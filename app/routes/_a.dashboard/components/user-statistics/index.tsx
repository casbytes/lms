import React from "react";
import { Await } from "@remix-run/react";
import { ImSpinner2 } from "react-icons/im";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { CourseCatalogCard } from "~/components/course-catalog";
import { Chart } from "./chart";
import { ICourseProgress } from "~/constants/types";

type StatisticsProps = {
  userCourses: Promise<any>;
};

export function Statistics({ userCourses }: StatisticsProps) {
  return (
    <Tabs defaultValue="catalog">
      <TabsList className="w-full flex bg-inherit justify-start mb-6">
        <div className="flex flex-wrap justify-between items-center w-full">
          <div>
            <TabsTrigger value="catalog" className="text-xl">
              My courses
            </TabsTrigger>
            <TabsTrigger value="chart" className="text-xl">
              Learning hours
            </TabsTrigger>
            <TabsTrigger value="progress" className="text-xl">
              Progress
            </TabsTrigger>
            <TabsTrigger value="achievements" className="text-xl">
              Acheivements
            </TabsTrigger>
          </div>
          {/* {tab === "chart" ? <ChartFilter /> : null} */}
        </div>
      </TabsList>
      <TabsContent value="chart" className="w-full">
        <Chart />
      </TabsContent>
      <TabsContent value="catalog" className="max-h-full">
        <React.Suspense fallback={<PendingCard />}>
          <Await resolve={userCourses}>
            {(userCourses) => <CourseCatalogCard userCourses={userCourses} />}
          </Await>
        </React.Suspense>
      </TabsContent>
      <TabsContent value="progress" className="max-h-full">
        some progress
      </TabsContent>
      <TabsContent value="achievements" className="max-h-full">
        achievements
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
