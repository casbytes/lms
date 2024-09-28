import React from "react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { getUser } from "~/utils/session.server";
import { metaFn } from "~/utils/meta";
import { ActiveSubCard } from "./components/active-sub-card";
import { ErrorDialog } from "./components/error-dialog";
import { SubscriptionTabs } from "~/components/subscription";
import { STRIPE } from "~/services/stripe.server";

export const meta = metaFn;

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const [user, plans] = await Promise.all([
      getUser(request),
      STRIPE.listPlans(),
    ]);

    const activeSubscription = user.subscribed
      ? await STRIPE.getActiveSubscription(user.subscriptionId!)
      : null;

    const url = new URL(request.url);
    const error = url.searchParams.get("error") === "true";
    return json({ user, plans, error, activeSubscription });
  } catch (error) {
    throw error;
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const user = await getUser(request);
  const intent = formData.get("intent") as "update" | "cancel";
  switch (intent) {
    case "update":
    case "cancel": {
      const session = await STRIPE.createBillingPortalSession(
        user.stripeCustomerId!
      );
      return redirect(session.url, 303);
    }
    default:
      throw new Error("Invalid intent.");
  }
}

export default function SubscriptionRoute() {
  const { user, plans, error, activeSubscription } =
    useLoaderData<typeof loader>();
  const [isError, setIsError] = React.useState(error);

  return (
    <Container className="max-w-6xl">
      <PageTitle title="subscription" />
      <ErrorDialog isError={isError} setIsError={setIsError} />
      {activeSubscription ? (
        <ActiveSubCard activeSubscription={activeSubscription} />
      ) : (
        <SubscriptionTabs plans={plans} user={user} className="mt-8" />
      )}
    </Container>
  );
}
