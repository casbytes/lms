import { type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { listPlans } from "~/services/stripe.server";
import { Home } from "~/components/home";

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

export default function Index() {
  const plans = useLoaderData<typeof loader>();
  return <Home plans={plans} />;
}
