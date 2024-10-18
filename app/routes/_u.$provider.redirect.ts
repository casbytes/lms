import invariant from "tiny-invariant";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  handleGithubRedirect,
  handleGoogleRedirect,
  handleMagiclinkRedirect,
} from "~/utils/providers.server";
import { PROVIDER } from "~/utils/helpers";

export function loader() {
  return redirect("/");
}

export async function action({ request, params }: ActionFunctionArgs) {
  const provider = params.provider as PROVIDER;
  invariant(provider, "Invalid form data.");

  try {
    switch (provider) {
      case PROVIDER.MagicLink:
        return await handleMagiclinkRedirect(request);
      case PROVIDER.Google:
        return await handleGoogleRedirect();
      case PROVIDER.Github:
        return await handleGithubRedirect();
      default:
        throw new Error("Invalid provider.");
    }
  } catch (error) {
    throw error;
  }
}
