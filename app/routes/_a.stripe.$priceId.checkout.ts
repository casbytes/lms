import invariant from "tiny-invariant";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { createCheckoutSession } from "~/services/stripe.server";
import { getUser } from "~/utils/session.server";

const { BASE_URL } = process.env;

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
      successUrl: `${BASE_URL}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${BASE_URL}/subscription?canceled=true`,
    });
    if (!session.url) throw new Error("No stripe session URL");
    return redirect(session.url, 303);
  } catch (error) {
    throw error;
  }
}
