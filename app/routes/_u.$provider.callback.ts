import invariant from "tiny-invariant";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { ensurePrimary } from "litefs-js/remix";
import { handleMagiclinkAuth } from "~/utils/session.server";

const { NODE_ENV } = process.env;
const P_MODE = NODE_ENV === "production";

export async function loader(loaderArgs: LoaderFunctionArgs) {
  try {
    invariant(
      loaderArgs.params.provider && loaderArgs.params.provider === "magic-link",
      "Invalid provider."
    );
    if (P_MODE) {
      await ensurePrimary();
    }
    return handleMagiclinkAuth(loaderArgs);
  } catch (error) {
    throw error;
  }
}
