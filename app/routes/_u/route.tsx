import { Outlet, useActionData, useLoaderData } from "@remix-run/react";
import { Footer } from "~/components/footer";
import { AuthDialog } from "./components/auth-dialog";
import { ActionFunctionArgs } from "@remix-run/node";
import { InternalServerError } from "~/errors";

export async function loader({ request }: ActionFunctionArgs) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email") as string | null;
    const success = url.searchParams.get("success") === "true";
    const response = {
      email,
      success,
    };
    return email ? { response } : { response: null };
  } catch (error) {
    throw new InternalServerError("Failed to process request.");
  }
}

export default function UnAuthApp() {
  const { response } = useLoaderData<typeof loader>();
  return (
    <>
      <Outlet />
      <AuthDialog response={response} />
      <Footer />
    </>
  );
}
