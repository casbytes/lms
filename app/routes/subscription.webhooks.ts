import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Stripe, STRIPE } from "~/services/stripe.server";
import {
  updateUserProgress,
  updateUserSubscription,
} from "~/utils/helpers.server";

export function loader() {
  return redirect("/");
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const event = await STRIPE.constructWebhookEvent(request);
    switch (event.type) {
      case "charge.succeeded":
      case "payment_intent.succeeded":
      case "invoice.payment_succeeded": {
        const paymentIntent = event.data.object;
        const customerId = paymentIntent.customer as string;
        await Promise.all([
          updateUserProgress(customerId),
          updateUserSubscription(customerId, true),
        ]);
        return new Response("Payment intent succeeded.", { status: 200 });
      }

      case "invoice.payment_failed":
      case "customer.subscription.updated": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          (invoice.customer as string) ?? subscription.customer;

        if (
          subscription.status === "canceled" ||
          subscription.status === "incomplete" ||
          subscription.status === "unpaid"
        ) {
         
          await updateUserSubscription(customerId, false);
          return new Response("Subscription updated, marked as inactive.", {
            status: 200,
          });
         
        } else if (invoice) {
          await updateUserSubscription(customerId, false);
          return new Response("Subscription updated, marked as active.", {
            status: 200,
          });
        }

        return new Response("Subscription canceled.", { status: 200 });
      }
      default: {
        return new Response("Unhandled webhook event.", { status: 400 });
      }
    }
  } catch (error) {
    return new Response("Webhook event failed.", { status: 500 });
  }
}
