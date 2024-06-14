import crypto from "node:crypto";
import invariant from "tiny-invariant";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useRouteError } from "@remix-run/react";
import { RootErrorUI } from "~/components/root-error-ui";
import { BadRequestError, InternalServerError } from "~/errors";
import { handleGoogleRedirect } from "~/services/google.server";
import { handleGithubRedirect } from "~/services/github.server";
import { handleMagiclinkRedirect } from "~/services/magic-link.server";

import {
  commitSessionOptions,
  getUserSession,
} from "~/services/sessions.server";

export async function loader() {
  return redirect("/");
}

export async function action({ request, params }: ActionFunctionArgs) {
  const provider = params.provider;
  try {
    invariant(provider, "Invalid provider.");
    const state = crypto.randomBytes(32).toString("hex");
    const session = await getUserSession(request);
    session.set("state", state);
    switch (provider) {
      case "magic-link":
        return handleMagiclinkRedirect(request, state);
      case "google":
        return redirect(
          await handleGoogleRedirect(state),
          await commitSessionOptions(session)
        );
      case "github":
        return redirect(
          await handleGithubRedirect(state),
          await commitSessionOptions(session)
        );
      default:
        throw new BadRequestError("Invalid provider.");
    }
  } catch (error) {
    if (error instanceof BadRequestError || error instanceof Error) throw error;
    throw new InternalServerError("Failed to generate auth URL.");
  }
}

export function ErrorBoundary() {
  const error = useRouteError();
  return <RootErrorUI error={error} />;
}
