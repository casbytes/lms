import invariant from "tiny-invariant";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { ensurePrimary } from "~/utils/litefs.server";
import {
  handleGithubCallback,
  handleGoogleCallback,
  handleMagiclinkCallback,
} from "~/utils/providers.server";

const { NODE_ENV } = process.env;

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.provider, "Invalid provider.");

  try {
    const provider = params.provider as "magic-link" | "google" | "github";
    if (NODE_ENV === "production") {
      await ensurePrimary();
    }
    switch (provider) {
      case "magic-link":
        return await handleMagiclinkCallback(request);
      case "google":
        return await handleGoogleCallback(request);
      case "github":
        return await handleGithubCallback(request);
      default:
        throw new Error("Invalid provider.");
    }
  } catch (error) {
    throw error;
  }
}
