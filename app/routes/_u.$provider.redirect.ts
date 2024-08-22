import invariant from "tiny-invariant";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { handleMagiclinkRedirect } from "~/utils/session.server";

export function loader() {
  return redirect("/");
}

export async function action({ request, params }: ActionFunctionArgs) {
  const provider = params.provider;

  try {
    invariant(provider, "Invalid provider.");
    return handleMagiclinkRedirect(request);
  } catch (error) {
    throw error;
  }
}
