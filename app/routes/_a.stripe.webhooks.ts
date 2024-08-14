import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Stripe, constructWebhookEvent } from "~/services/stripe.server";
import { prisma } from "~/utils/db.server";

export function loader() {
  return redirect("/");
}

export async function action({ request }: ActionFunctionArgs) {
  async function updateUserSubscription(
    stripeCustomerId: string,
    subscribed: boolean
  ) {
    return await prisma.user.update({
      where: { stripeCustomerId },
      data: {
        subscribed,
      },
    });
  }
  try {
    const event = await constructWebhookEvent(request);
    if (!event) {
      return new Response("Webhook Error", { status: 400 });
    }

    switch (event.type) {
      case "customer.subscription.updated":
      case "invoice.payment_succeeded":
        {
          const customer = (
            event.data.object as Stripe.Subscription | Stripe.Invoice
          ).customer;
          await updateUserSubscription(customer as string, true);
        }
        break;

      case "customer.subscription.deleted":
      case "invoice.payment_failed":
        {
          const customer = (
            event.data.object as Stripe.Subscription | Stripe.Invoice
          ).customer;
          await updateUserSubscription(customer as string, false);
        }
        break;

      default:
        return new Response("Unhandled event type", { status: 400 });
    }
    return new Response("Success", { status: 200 });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Webhook Error:", error);
    return new Response("Webhook Error", { status: 400 });
  }
}
