import { useRouteError } from "@remix-run/react";
import React from "react";
import { Container } from "~/components/container";
import { ErrorUI } from "~/components/error-ui";
import { PageTitle } from "~/components/page-title";

export default function EventsRoute() {
  return (
    <Container className="max-w-4xl">
      <PageTitle title="events" />
    </Container>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return <ErrorUI error={error} />;
}
