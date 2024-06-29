import React from "react";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { listPlans, retrieveSubscriptions } from "~/services/stripe.server";
import { Subscription } from "./components/subscription";
import { CheckoutSuccessUI } from "./components/success-ui";
import { CheckoutCancelUI } from "./components/canceled-ui";
import { getUser } from "~/utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const [user, plans] = await Promise.all([getUser(request), listPlans()]);
  const subs = await retrieveSubscriptions({
    customerId: user.stripeCustomerId!,
  });
  const url = new URL(request.url);
  const success = url.searchParams.get("success") === "true";
  const canceled = url.searchParams.get("canceled") === "true";
  return json({ user, plans, subs, success, canceled });
}

export default function SubscriptionRoute() {
  const [status, setStatus] = React.useState<"success" | "canceled" | null>(
    null
  );
  const { user, plans, subs, success, canceled } =
    useLoaderData<typeof loader>();

  const isSuccess = status === "success";
  const isCanceled = status === "canceled";

  React.useEffect(() => {
    if (success) {
      setStatus("success");
    } else if (canceled) {
      setStatus("canceled");
    } else {
      setStatus(null);
    }
  }, [success, canceled]);

  return (
    <Container className="max-w-4xl">
      <PageTitle title="subscription" />
      {isSuccess ? (
        <CheckoutSuccessUI setStatus={setStatus} />
      ) : isCanceled ? (
        <CheckoutCancelUI setStatus={setStatus} />
      ) : (
        <Subscription plans={plans} user={user} subs={subs} />
      )}
    </Container>
  );
}
