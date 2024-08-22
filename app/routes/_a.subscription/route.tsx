import React from "react";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { listPlans, listSubscriptions } from "~/services/stripe.server";
import { Subscription } from "./components/subscription";
import { CheckoutSuccessUI } from "./components/success-ui";
import { CheckoutCancelUI } from "./components/canceled-ui";
import { getUser } from "~/utils/session.server";
import { metaFn } from "~/utils/meta";

export const meta = metaFn;

export async function loader({ request }: LoaderFunctionArgs) {
  const [user, plans] = await Promise.all([getUser(request), listPlans()]);
  const subs = await listSubscriptions({
    customerId: user.stripeCustomerId!,
  });
  const url = new URL(request.url);
  const success = url.searchParams.get("success") === "true";
  const canceled = url.searchParams.get("canceled") === "true";
  return json({ user, plans, subs, success, canceled });
}

type StatusState = "success" | "canceled" | null;
export type StatusAction =
  | { type: "SET_SUCCESS" }
  | { type: "SET_CANCELED" }
  | { type: "RESET" };

export default function SubscriptionRoute() {
  const { user, plans, subs, success, canceled } =
    useLoaderData<typeof loader>();

  function statusReducer(
    state: StatusState,
    action: StatusAction
  ): StatusState {
    switch (action.type) {
      case "SET_SUCCESS":
        return "success";
      case "SET_CANCELED":
        return "canceled";
      case "RESET":
        return null;
      default:
        return state;
    }
  }

  const [status, dispatch] = React.useReducer(statusReducer, null);
  const isSuccess = status === "success";
  const isCanceled = status === "canceled";

  React.useEffect(() => {
    if (success) {
      dispatch({ type: "SET_SUCCESS" });
    } else if (canceled) {
      dispatch({ type: "SET_CANCELED" });
    } else {
      dispatch({ type: "RESET" });
    }
  }, [success, canceled]);

  return (
    <Container className="max-w-6xl">
      <PageTitle title="subscription" />
      {isSuccess ? (
        <CheckoutSuccessUI dispatch={dispatch} />
      ) : isCanceled ? (
        <CheckoutCancelUI dispatch={dispatch} />
      ) : (
        <Subscription plans={plans} user={user} subs={subs} />
      )}
    </Container>
  );
}
