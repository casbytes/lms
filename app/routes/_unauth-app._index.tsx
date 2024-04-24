import { type MetaFunction } from "@remix-run/node";
import { Home } from "~/components/home";

export const meta: MetaFunction = () => {
  return [
    { title: "CASBytes" },
    { name: "description", content: "An onile school for software engineers." },
  ];
};

/**
 * *The index route for the unauthenticated app.
 * @returns {React.ReactElement}
 */
export default function Index(): React.ReactElement {
  return <Home />;
}
