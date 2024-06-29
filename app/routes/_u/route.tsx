import React from "react";
import { Outlet, useLoaderData } from "@remix-run/react";
import { Footer } from "~/components/footer";
import { AuthDialog } from "./components/auth-dialog";
import { ActionFunctionArgs } from "@remix-run/node";
import { handleResponse } from "./utils.client";
import { getResponse } from "./utils.server";

export async function loader({ request }: ActionFunctionArgs) {
  const response = await getResponse(request);
  return { response };
}

export default function UnAuthApp() {
  const { response } = useLoaderData<typeof loader>();

  React.useEffect(() => {
    if (response) handleResponse(response);
  }, [response.success, response.error]);

  return (
    <>
      <Outlet />
      <AuthDialog />
      <Footer />
    </>
  );
}
