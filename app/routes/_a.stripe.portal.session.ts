import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { createBillingPortalSession } from "~/services/stripe.server";
import { getUser } from "~/utils/session.server";

const { BASE_URL } = process.env;

export function loader() {
  return redirect("/");
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const user = await getUser(request);
    const portalSession = await createBillingPortalSession({
      customerId: user.stripeCustomerId!,
      returnUrl: `${BASE_URL}/subscription`,
    });
    return redirect(portalSession.url, 303);
  } catch (error) {
    throw error;
  }
}
