import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { createBillingPortalSession } from "~/services/stripe.server";
import { getUser } from "~/utils/session.server";

const { BASE_URL, DEV_BASE_URL, NODE_ENV } = process.env;
const baseUrl = NODE_ENV === "production" ? BASE_URL : DEV_BASE_URL;

export function loader() {
  return redirect("/");
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const user = await getUser(request);
    const portalSession = await createBillingPortalSession({
      customerId: user.stripeCustomerId!,
      returnUrl: `${baseUrl}/subscription`,
    });
    return redirect(portalSession.url, 303);
  } catch (error) {
    throw error;
  }
}
