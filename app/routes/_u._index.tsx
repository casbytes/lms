import React from "react";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { listPlans } from "~/services/stripe.server";
import { Home } from "~/components/home";
import {
  destroyAuthSession,
  getUser,
  getUserSession,
  sessionKey,
} from "~/utils/session.server";
import { toast } from "~/components/ui/use-toast";
import { Role } from "~/constants/enums";
import { metaFn } from "~/utils/meta";

export const meta = metaFn;

export async function loader({ request }: LoaderFunctionArgs) {
  let error: string | undefined;
  try {
    const session = await getUserSession(request);
    if (session.has(sessionKey)) {
      const user = await getUser(request);
      const redirectUrl =
        user.role === Role.USER ? user?.currentUrl ?? "/dashboard" : "/a";
      return redirect(redirectUrl);
    }
    if (session.has("error")) {
      error = session.get("error");
    }
    const plans = await listPlans();
    return json({ plans, error }, await destroyAuthSession(session));
  } catch (error) {
    throw error;
  }
}

export default function Index() {
  const { plans, error } = useLoaderData<typeof loader>();

  React.useEffect(() => {
    if (error) {
      toast({
        title: error,
        description: "Please sign-in to continue.",
        variant: "destructive",
      });
    }
  }, [error]);

  return <Home plans={plans} />;
}
