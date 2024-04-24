import { LoaderFunctionArgs } from "@remix-run/node";
import { AuthAppLayout } from "~/components/layouts";
import { getUser } from "~/utils/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    await getUser(request);
  } catch (error) {
    throw error;
  }
  return null;
};

export function meta() {}
export default function AuthApp() {
  return <AuthAppLayout />;
}
