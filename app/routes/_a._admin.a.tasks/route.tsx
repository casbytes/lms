import React from "react";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { TaskTable } from "./tasks-table";

export default function AdminTasksRoute() {
  return (
    <Container className="max-w-7xl">
      <PageTitle title="submitted tasks" />
      <TaskTable />
    </Container>
  );
}
