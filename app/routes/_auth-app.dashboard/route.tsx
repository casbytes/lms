import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { useLoaderData, useRouteError } from "@remix-run/react";
import { ErrorUI } from "~/components/error-ui";
import { CoursesCard } from "./components/courses-card";
import { MembershipCard } from "~/components/membership-card";
import { DiscordCard } from "~/components/discord-card";
import { UserCard } from "./components/user-card";
import { Statistics } from "./components/user-statistics";
import { getUser } from "~/utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const user = await getUser(request);
    return json({ user });
  } catch (error) {
    throw error;
  }
}

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <Container className="bg-header-2 bg-no-repeat">
      <div className="lg:p-8 max-w-6xl mx-auto">
        <PageTitle title="Dashboard" className="mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-4 rounded-md drop-shadow-sm">
          <div className="flex gap-10 flex-col">
            <div>
              <CoursesCard />
            </div>
            <DiscordCard />
          </div>
          <div className="flex flex-col gap-10 order-first md:order-last">
            <UserCard user={user} />
            <div>
              <Statistics />
            </div>
            <MembershipCard />
          </div>
        </div>
      </div>
    </Container>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return <ErrorUI error={error} />;
}
