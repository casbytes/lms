import { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { checkRole } from "~/utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return checkRole(request);
}

export default function AdminRoute() {
  return <Outlet />;
}
