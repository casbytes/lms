import React from "react";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";

export default function AdminTasksRoute() {
  return (
    <Container className="max-w-7xl">
      <PageTitle title="submitted tasks" />
    </Container>
  );
}
