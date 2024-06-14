import invariant from "tiny-invariant";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { useRouteError } from "@remix-run/react";
import { RootErrorUI } from "~/components/root-error-ui";
import { BadRequestError, InternalServerError } from "~/errors";
import { handleGithubAuth } from "~/services/github.server";
import { handleGoogleAuth } from "~/services/google.server";
import { handleMagiclinkAuth } from "~/services/magic-link.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    invariant(params.provider, "Invalid provider.");
    const provider = params.provider;
    switch (provider) {
      case "magic-link":
        return handleMagiclinkAuth(request, params);
      case "google":
        return handleGoogleAuth(request, params);
      case "github":
        return handleGithubAuth(request, params);
      default:
        throw new BadRequestError("Invalid provider.");
    }
  } catch (error) {
    console.error(error);
    if (error instanceof BadRequestError || error instanceof Error) throw error;
    throw new InternalServerError("Failed to process request.");
  }
}

export function ErrorBoundary() {
  const error = useRouteError();
  return <RootErrorUI error={error} />;
}
