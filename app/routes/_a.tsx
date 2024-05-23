import { LoaderFunctionArgs } from "@remix-run/node";
import { getUser } from "./sessions";
import { Outlet, useRouteError } from "@remix-run/react";
import { ErrorUI } from "~/components/error-ui";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    await getUser(request);
  } catch (error) {
    throw new Error("Unauthorized");
  }
  return null;
};

export default function AuthApp() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  return <ErrorUI error={error} />;
}
