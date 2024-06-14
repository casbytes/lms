import { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useRouteError } from "@remix-run/react";
import { ErrorUI } from "~/components/error-ui";
import { InternalServerError } from "~/errors";
import { checkUser } from "~/services/sessions.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    return checkUser(request);
  } catch (error) {
    throw new InternalServerError();
  }
};

export default function AuthApp() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  return <ErrorUI error={error} />;
}
