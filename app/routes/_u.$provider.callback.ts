import invariant from "tiny-invariant";
import { type LoaderFunctionArgs } from "@remix-run/node";
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
    throw error;
  }
}
