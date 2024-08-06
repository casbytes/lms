import { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { checkAdmin } from "~/utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return await checkAdmin(request);
}

export default function AdminRoute() {
  return <Outlet />;
}
