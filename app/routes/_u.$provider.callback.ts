import invariant from "tiny-invariant";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { ensurePrimary } from "~/utils/litefs.server";
import {
  handleGithubCallback,
  handleGoogleCallback,
  handleMagiclinkCallback,
} from "~/utils/session.server";
const { NODE_ENV } = process.env;

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    invariant(params.provider, "Invalid provider.");
    const provider = params.provider as "magic-link" | "google" | "github";

    if (NODE_ENV === "production") {
      await ensurePrimary();
    }
    switch (provider) {
      case "magic-link":
        return handleMagiclinkCallback(request);
      case "google":
        return handleGoogleCallback(request);
      case "github":
        return handleGithubCallback(request);
      default:
        throw new Error("Invalid intent.");
    }
  } catch (error) {
    throw error;
  }
}
