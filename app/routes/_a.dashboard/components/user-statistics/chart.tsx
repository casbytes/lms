import React, { PureComponent } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Sun", hours: 0 },
  { name: "Mon", hours: 4 },
  { name: "Tue", hours: 3 },
  { name: "Wed", hours: 5 },
  { name: "Thur", hours: 2 },
  { name: "Fri", hours: 1 },
  { name: "Sat", hours: 1.5 },
];

export function Chart() {
  return (
    // <div style={{ width: "100%" }}>
    <ResponsiveContainer
      width="100%"
      height={250}
      className="w-full flex justify-start"
    >
      <LineChart
        // width={400}
        className="w-full"
        height={200}
        data={data}
        margin={{
          top: 10,
          right: 0,
          left: -40,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line
          connectNulls
          type="monotone"
          dataKey="hours"
          stroke="#8884d8"
          fill="#8884d8"
        />
      </LineChart>
    </ResponsiveContainer>
    // </div>
  );
}
