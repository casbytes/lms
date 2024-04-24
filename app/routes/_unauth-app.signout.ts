import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { getUserSession, signOut } from "~/utils/session.server";
import { destroySession } from "./sessions";

export async function action({ request }: ActionFunctionArgs) {
  try {
    return redirect("/", {
      headers: {
        "Set-Cookie": await destroySession(await getUserSession(request), {
          maxAge: 0,
        }),
      },
    });
  } catch (error) {
    throw error;
  }
}
