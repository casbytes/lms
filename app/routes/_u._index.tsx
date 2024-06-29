import { type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Home } from "~/components/home";
import { listPlans } from "~/services/stripe.server";

export const meta: MetaFunction = () => {
  return [
    { title: "CASBytes" },
    { name: "description", content: "An onile school for software engineers." },
  ];
};

export async function loader() {
  try {
    return await listPlans();
  } catch (error) {
    throw error;
  }
}

/**
 * *The index route for the unauthenticated app.
 * @returns {React.ReactElement}
 */
export default function Index(): React.ReactElement {
  const plans = useLoaderData<typeof loader>();
  return <Home plans={plans} />;
}
