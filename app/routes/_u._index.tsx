import React from "react";
import { defer, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Home } from "~/components/home";
import {
  destroyAuthSession,
  getUser,
  getUserSession,
  sessionKey,
} from "~/utils/session.server";
import { toast } from "~/components/ui/use-toast";
import { metaFn } from "~/utils/meta";
import { ROLE } from "~/utils/helpers";
import { STRIPE } from "~/services/stripe.server";
import { getMetaCourses, getMetaModules } from "~/services/sanity/index.server";

export const meta = metaFn;

export async function loader({ request }: LoaderFunctionArgs) {
  let error: string | undefined;
  try {
    const url = new URL(request.url);
    const searchTerm = url.searchParams.get("moduleTitle");
    const plans = STRIPE.listPlans();
    const courses = getMetaCourses();
    const modules = getMetaModules({ searchTerm });
    const session = await getUserSession(request);
    if (session.has(sessionKey)) {
      const user = await getUser(request);
      const redirectUrl =
        user.role === ROLE.USER
          ? !user.completedOnboarding
            ? "/onboarding"
            : user.currentUrl ?? "/dashboard"
          : "/a";
      throw redirect(redirectUrl);
    }
    if (session.has("error")) {
      error = session.get("error");
    }

    return defer(
      { plans, courses, modules, error },
      await destroyAuthSession(session)
    );
  } catch (error) {
    throw error;
  }
}

export default function Index() {
  const { plans, courses, modules, error } = useLoaderData<typeof loader>();

  React.useEffect(() => {
    if (error) {
      toast({
        title: error,
        description: "Please sign-in to continue.",
        variant: "destructive",
      });
    }
  }, [error]);

  return <Home plans={plans} courses={courses} modules={modules} />;
}
