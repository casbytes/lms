import { useRouteError } from "@remix-run/react";
import { Container } from "~/components/container";
import { ErrorUI } from "~/components/error-ui";
import { PageTitle } from "~/components/page-title";

export default function Subscription() {
  return (
    <Container className="max-w-4xl">
      <PageTitle title="subscription" />
    </Container>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return <ErrorUI error={error} />;
}
