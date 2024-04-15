import { ActionFunctionArgs } from "@remix-run/node";
import { signOut } from "~/utils/session.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    await signOut(request);
  } catch (error) {
    throw error;
  }
}
