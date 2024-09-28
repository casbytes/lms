import { ActionFunctionArgs, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { STRIPE } from "~/services/stripe.server";
import { getUser } from "~/utils/session.server";

export function loader() {
  return redirect("/");
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as "subscribe";
  const plan = formData.get("plan") as string;
  invariant(intent === "subscribe", "Invalid intent.");
  invariant(plan, "Plan is required.");

  const user = await getUser(request);
  try {
    const session = await STRIPE.createCheckoutSession({
      customerId: user.stripeCustomerId!,
      priceId: plan,
    });
    return redirect(session.url!, 303);
  } catch (error) {
    throw error;
  }
}
