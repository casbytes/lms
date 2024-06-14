import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { prisma } from "~/libs/prisma.server";
import { useRouteError } from "@remix-run/react";
import { RootErrorUI } from "~/components/root-error-ui";
import { BadRequestError, InternalServerError } from "~/errors";
import { getUser, signOut } from "~/services/sessions.server";

export function loader() {
  return redirect("/");
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

    return signOut(request);
  } catch (error) {
    console.error(error);
    if (error instanceof BadRequestError) {
      throw error;
    }
    throw new InternalServerError();
  }
}

export function ErrorBoundary() {
  const error = useRouteError();
  return <RootErrorUI error={error} />;
}
