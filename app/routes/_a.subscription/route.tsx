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
import {
  FetchSubscription,
  GenerateSubscriptionLink,
  Paystack,
} from "~/services/paystack.server";
import { SubscriptionCard } from "./components/subscription-card";
import { ActiveSubCard } from "./components/active-sub-card";
import { ErrorDialog } from "./components/error-dialog";

export const meta = metaFn;

export async function loader({ request }: LoaderFunctionArgs) {
  const [user, plans] = await Promise.all([
    getUser(request),
    Paystack.listPlans(),
  ]);
  const activeSubscription = await Paystack.retrieveActiveSubscription(
    user.paystackCustomerCode!
  ).then((res) => (res as FetchSubscription | undefined)?.data);

  const url = new URL(request.url);
  const error = url.searchParams.get("error") === "true";
  return json({ user, plans, error, activeSubscription });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as "update" | "cancel";
  const code = formData.get("code") as string;
  switch (intent) {
    case "update":
    case "cancel": {
      const res = await Paystack.updateSubscription(code);
      if (!res.status) {
        throw redirect("/subscription?error=true");
      }
      return redirect((res as GenerateSubscriptionLink).data.link, 303);
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
      {activeSubscription?.plan ? (
        <ActiveSubCard activeSubscription={activeSubscription} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {plans?.length &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            plans?.map((plan: Record<string, any>) => (
              <SubscriptionCard plan={plan} user={user} key={plan.id} />
            ))}
        </div>
      )}
    </Container>
  );
}
