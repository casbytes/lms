import invariant from "tiny-invariant";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { BadRequestError, InternalServerError } from "~/errors";
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
    console.error("Error:", error);
    if (error instanceof BadRequestError || error instanceof Error) throw error;
    throw new InternalServerError("Failed to generate auth URL.");
  }
}
