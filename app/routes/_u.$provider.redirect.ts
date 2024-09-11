import invariant from "tiny-invariant";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  handleGithubRedirect,
  handleGoogleRedirect,
  handleMagiclinkRedirect,
} from "~/utils/session.server";

export function loader() {
  return redirect("/");
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.provider, "Invalid form data.");
  const provider = params.provider as "magic-link" | "google" | "github";

  try {
    switch (provider) {
      case "magic-link":
        return await handleMagiclinkRedirect(request);
      case "google":
        return await handleGoogleRedirect();
      case "github":
        return await handleGithubRedirect();
      default:
        throw new Error("Invalid provider.");
    }
  } catch (error) {
    throw error;
  }
}
