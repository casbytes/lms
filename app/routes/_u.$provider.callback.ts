import invariant from "tiny-invariant";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { BadRequestError, InternalServerError } from "~/errors";
import { ensurePrimary } from "litefs-js/remix";
import { handleMagiclinkAuth } from "~/utils/session.server";

const { NODE_ENV } = process.env;

export async function loader(loaderArgs: LoaderFunctionArgs) {
  try {
    invariant(
      loaderArgs.params.provider && loaderArgs.params.provider === "magic-link",
      "Invalid provider."
    );
    if (NODE_ENV === "production") {
      await ensurePrimary();
    }
    return handleMagiclinkAuth(loaderArgs);
  } catch (error) {
    if (error instanceof BadRequestError || error instanceof Error) throw error;
    throw new InternalServerError("Failed to process request.");
  }
}
