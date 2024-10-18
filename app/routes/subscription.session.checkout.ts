import invariant from "tiny-invariant";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { STRIPE } from "~/services/stripe.server";
import { prisma } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";

export function loader() {
  return redirect("/");
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const user = await getUser(request);
  
  const intent = formData.get("intent") as "subscribe";
  const planId = formData.get("planId") as string;
  invariant(intent === "subscribe", "Invalid intent.");
  invariant(planId, "Plan ID is required.");

  try {
    const session = await STRIPE.createCheckoutSession({
      customerId: user.stripeCustomerId!,
      priceId: planId,
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionId: session.id! },
    });
    return redirect(session.url!, 303);
  } catch (error) {
    throw new Error("Failed to create checkout session");
  }
}
