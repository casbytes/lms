import { LoaderFunctionArgs } from "@remix-run/node";
import { checkUser } from "../utils/sessions.server";
import { Outlet, useRouteError } from "@remix-run/react";
import { ErrorUI } from "~/components/error-ui";
import { InternalServerError } from "~/errors";

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
