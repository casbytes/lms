import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ChartFilter } from "./chart-filter";
import { CourseCatalogCard } from "~/components/course-catalog";
import { Chart } from "./chart";
import { ICourseProgress } from "~/constants/types";

type StatisticsProps = {
  userCourses: ICourseProgress[];
};

export function Statistics({ userCourses }: StatisticsProps) {
  const [tab, setTab] = React.useState("chart");
  console.log(userCourses);

  React.useEffect(() => {
    setTab("progress");
  }, []);

  return (
    <Tabs defaultValue="progress">
      <TabsList className="w-full flex bg-inherit justify-start mb-6">
        <div className="flex flex-wrap justify-between items-center w-full">
          <div>
            <TabsTrigger
              onClick={() => setTab("progress")}
              value="progress"
              className="text-xl"
            >
              My courses
            </TabsTrigger>
            <TabsTrigger
              onClick={() => setTab("chart")}
              value="chart"
              className="text-xl"
            >
              Learning hours
            </TabsTrigger>
          </div>
          {tab === "chart" ? <ChartFilter /> : null}
        </div>
      </TabsList>
      <TabsContent value="chart" className="w-full">
        <Chart />
      </TabsContent>
      <TabsContent value="progress" className="max-h-full">
        <CourseCatalogCard userCourses={userCourses} />
      </TabsContent>
    </Tabs>
  );
}
