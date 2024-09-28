import invariant from "tiny-invariant";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { ensurePrimary } from "~/utils/litefs.server";
import {
  handleGithubCallback,
  handleGoogleCallback,
  handleMagiclinkCallback,
} from "~/utils/providers.server";
import { PROVIDER } from "~/utils/helpers";

const { NODE_ENV } = process.env;

export async function loader({ request, params }: LoaderFunctionArgs) {
  const provider = params.provider as PROVIDER;
  invariant(provider, "Invalid provider.");

  try {
    if (NODE_ENV === "production") {
      await ensurePrimary();
    }
    switch (provider) {
      case PROVIDER.MagicLink:
        return await handleMagiclinkCallback(request);
      case PROVIDER.Google:
        return await handleGoogleCallback(request);
      case PROVIDER.Github:
        return await handleGithubCallback(request);
      default:
        throw new Error("Invalid provider.");
    }
  } catch (error) {
    throw error;
  }
}
