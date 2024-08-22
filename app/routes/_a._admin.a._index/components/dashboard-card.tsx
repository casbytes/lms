import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

type DashboardCardProps = {
  cardTitle: string;
  cardIcon: React.ReactNode;
  cardContent: React.ReactNode;
};

export function DashboardCard({
  cardTitle,
  cardIcon,
  cardContent,
}: DashboardCardProps) {
  return (
    <Card x-chunk="dashboard-01-chunk-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{cardTitle}</CardTitle>
        {cardIcon}
      </CardHeader>
      <CardContent>{cardContent}</CardContent>
    </Card>
  );
}
