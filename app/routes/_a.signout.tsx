import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import {
  destroySession,
  getUser,
  getUserSession,
} from "../utils/sessions.server";
import { prisma } from "~/libs/prisma.server";
import { useRouteError } from "@remix-run/react";
import { RootErrorUI } from "~/components/root-error-ui";
import { BadRequestError, UnAuthorizedError } from "~/errors";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    return getUser(request);
  } catch (error) {
    throw new UnAuthorizedError();
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const { id } = await getUser(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const currentUrl = String(formData.get("currentUrl"));

  /**
   * If the intent is to sign out, update the user's current URL
   * to redirect them back to the page they were on before signing out.
   */
  try {
    /**
     * We will first of all check if a user exist inorder
     * to prevent any form of error incase a user has deleted their account,
     * and the session is still active, we won't update the user's current URL,
     * instead we will just destroy the session and redirect them to the
     * homepage.
     */

    if (intent !== "signout") {
      throw new BadRequestError("Invalid form data.");
    }

    const user = await prisma.user.findFirst({
      where: { id },
    });

    if (user) {
      await prisma.user.update({
        where: { id },
        data: { currentUrl },
      });
    }

    return redirect("/", {
      headers: {
        "Set-Cookie": await destroySession(await getUserSession(request), {
          maxAge: 0,
        }),
      },
    });
  } catch (error) {
    throw new Error(
      "An error occured while signing out, please try refreshing the page."
    );
  }
}

export function ErrorBoundary() {
  const error = useRouteError();
  return <RootErrorUI error={error} />;
}
