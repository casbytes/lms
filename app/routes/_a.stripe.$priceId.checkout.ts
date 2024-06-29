import invariant from "tiny-invariant";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { InternalServerError } from "~/errors";
import { createCheckoutSession } from "~/services/stripe.server";
import { getUser } from "~/utils/session.server";

const { BASE_URL, DEV_BASE_URL, NODE_ENV } = process.env;
const baseUrl = NODE_ENV === "production" ? BASE_URL : DEV_BASE_URL;

export function loader() {
  return redirect("/");
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const priceId = params.priceId;
  invariant(intent, "No intent found in form data");
  invariant(priceId, "Price ID is required.");

  try {
    const user = await getUser(request);
    const session = await createCheckoutSession({
      priceId,
      customerId: user.stripeCustomerId!,
      successUrl: `${baseUrl}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/subscription?canceled=true`,
    });
    if (!session.url) throw new InternalServerError("No session URL found");
    return redirect(session.url, 303);
  } catch (error) {
    console.error(error);
    throw new InternalServerError();
  }
}
