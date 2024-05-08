import { LoaderFunctionArgs } from "@remix-run/node";
import { AuthAppLayout } from "~/components/layouts";
import { getUser } from "./sessions";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    await getUser(request);
  } catch (error) {
    throw new Error("Unauthorized");
  }
  return null;
};

export default function AuthApp() {
  return <AuthAppLayout />;
}
