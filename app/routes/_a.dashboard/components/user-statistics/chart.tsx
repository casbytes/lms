import React from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

type ChartProps = {
  timeData: { date: string; hours: number }[];
};

export function Chart({ timeData }: ChartProps) {
  const MemoizedChart = React.useMemo(
    () => (
      <ResponsiveContainer
        width="100%"
        height={250}
        className="w-full flex justify-start"
      >
        <BarChart
          margin={{
            right: 20,
            left: -20,
          }}
          data={timeData}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="hours" fill="#306BAC" />
        </BarChart>
      </ResponsiveContainer>
    ),
    [timeData]
  );

  return <>{MemoizedChart}</>;
}
