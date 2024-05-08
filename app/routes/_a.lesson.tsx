import { Outlet, useRouteError } from "@remix-run/react";
import { ErrorUI } from "~/components/error-ui";

export default function LessonRoute() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  return <ErrorUI error={error} />;
}
