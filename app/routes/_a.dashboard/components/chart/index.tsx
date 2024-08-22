import React from "react";
import { Await } from "@remix-run/react";
import { XAxis, YAxis, CartesianGrid, AreaChart, Area } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { ChartFilter } from "./chart-filter";
import { PendingCard } from "../pending-card";

type ChartProps = {
  timeData: Promise<{ date: string; hours: number }[]>;
};

const chartConfig = {
  hours: {
    label: "hours",
    color: "#2563eb",
  },
} satisfies ChartConfig;

export function Chart({ timeData }: ChartProps) {
  const MemoizedChart = React.useMemo(
    () => (
      <div className="flex flex-col border border-sky-500 rounded-md p-2 shadow-lg">
        <div className="flex justify-between items-centerp mx-4 mb-2">
          <ChartFilter />
          <span className="text-sky-600">Learning time</span>
        </div>
        <React.Suspense fallback={<PendingCard />}>
          <Await resolve={timeData}>
            {(timeData) => (
              <ChartContainer
                config={chartConfig}
                className="-ml-8 min-h-48 max-h-48 h-48 w-full"
              >
                <AreaChart
                  accessibilityLayer
                  data={timeData}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <YAxis />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area
                    dataKey="hours"
                    type="natural"
                    fill="#0ea5e9"
                    fillOpacity={0.4}
                    stroke="#0284c7"
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </Await>
        </React.Suspense>
      </div>
    ),
    [timeData]
  );

  return <>{MemoizedChart}</>;
}
