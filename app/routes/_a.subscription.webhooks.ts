import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Paystack } from "~/services/paystack.server";
import {
  updateUserProgress,
  updateUserSubscription,
} from "~/utils/helpers.server";

export function loader() {
  return redirect("/");
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const webhook = await Paystack.constructWebhookEvent(request);
    const { data } = webhook;
    switch (webhook.event) {
      case "charge.success":
      case "subscription.create": {
        const customerCode = data.customer.customer_code;
        await Promise.all([
          updateUserSubscription(customerCode, true),
          updateUserProgress(customerCode),
        ]);
        break;
      }

      case "subscription.disable":
      case "invoice.payment_failed": {
        const customerCode = data.customer.customer_code;
        await updateUserSubscription(customerCode, false);
        break;
      }
      default:
        return new Response("Unhandled event", { status: 400 });
    }

    return new Response("Success", { status: 200 });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Webhook Error:", error);
    return new Response("Webhook Error", { status: 400 });
  }
}
