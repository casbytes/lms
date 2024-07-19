import { ActionFunctionArgs, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { getUserId, signOut } from "~/utils/session.server";
import { prisma } from "~/utils/db.server";

export function loader() {
  return redirect("/");
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await getUserId(request);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const currentUrl = formData.get("currentUrl") as string;
  try {
    /**
     * We will first of all check if a user exist inorder
     * to prevent any form of error incase a user has deleted their account,
     * and the session is still active, we won't update the user's current URL,
     * instead we will just destroy the session and redirect them to the
     * homepage.
     */
    invariant(intent === "signout", "Invalid form data.");
    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (user) {
      await prisma.user.update({
        where: { id: userId },
        data: { currentUrl },
      });
    }

    return signOut(request);
  } catch (error) {
    throw error;
  }
}
