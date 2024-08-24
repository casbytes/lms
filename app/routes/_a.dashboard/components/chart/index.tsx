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
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

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
      <Card className="border-sky-500 shadow-lg">
        <CardHeader className="py-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sky-600 font-mono">
              Learning time
            </CardTitle>
            <ChartFilter />
          </div>
        </CardHeader>
        <React.Suspense fallback={<PendingCard />}>
          <Await resolve={timeData}>
            {(timeData) => (
              <CardContent>
                <ChartContainer
                  config={chartConfig}
                  className="-ml-8 min-h-44 max-h-44 h-44 w-full"
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
              </CardContent>
            )}
          </Await>
        </React.Suspense>
      </Card>
    ),
    [timeData]
  );

  return <>{MemoizedChart}</>;
}
