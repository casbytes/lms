import invariant from "tiny-invariant";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Stripe, constructWebhookEvent } from "~/services/stripe.server";
import { prisma } from "~/utils/db.server";

export function loader() {
  return redirect("/");
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const event = await constructWebhookEvent(request);
    if (!event) {
      return new Response("Webhook Error", { status: 400 });
    }
    switch (event.type) {
      case "checkout.session.completed":
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        const customerEmail = checkoutSession.customer_details?.email;
        invariant(customerEmail, "Customer email is required");
        return await prisma.user.update({
          where: { email: customerEmail },
          data: {
            subscribed: true,
          },
        });

      case "customer.subscription.updated":
        const subscription = event.data.object as Stripe.Subscription;
        // Do something with the subscription
        console.log(subscription);
        break;

      default:
        break;
    }
    return null;
  } catch (error) {
    console.error(error);
    return new Response("Webhook Error", { status: 400 });
  }
}
