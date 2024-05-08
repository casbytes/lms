import React from "react";
import { ActionFunctionArgs, LoaderFunctionArgs, defer } from "@remix-run/node";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { Await, useLoaderData, useRouteError } from "@remix-run/react";
import { ErrorUI } from "~/components/error-ui";
import { CoursesCard } from "./components/courses-card";
import { MembershipCard } from "~/components/membership-card";
import { DiscordCard } from "~/components/discord-card";
import { UserCard } from "./components/user-card";
import { Statistics } from "./components/user-statistics";
import { addCourseToCatalog, getCourses, getUserCourses } from "./utils";
import { getUser } from "../sessions";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const data = getCourses(request);
    const userCourses = getUserCourses(request);
    const user = await getUser(request);
    return defer({ data, userCourses, user });
  } catch (error) {
    throw new Error("Failed to load dashboard data, please try again.");
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const courseId = String(formData.get("courseId"));
  const { userId } = await getUser(request);

  try {
    if (intent === "addCourseToCatalog") {
      await addCourseToCatalog(userId, courseId);
    } else {
      throw new Error("Invalid catalog intent");
    }
  } catch (error) {
    console.error(error);

    throw new Error("Failed to add course to catalog");
  }
  return null;
}

export default function Dashboard() {
  const { data, userCourses, user } = useLoaderData<typeof loader>();

  return (
    <Container className="bg-2 bg-no-repeat">
      <div className="lg:p-8 max-w-6xl mx-auto">
        <PageTitle title="Dashboard" className="mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-4 rounded-md drop-shadow-sm">
          <div className="flex gap-10 flex-col">
            <React.Suspense fallback={<>Loading...</>}>
              <Await resolve={data}>
                {(data) => <CoursesCard data={data} />}
              </Await>
            </React.Suspense>
            <DiscordCard />
          </div>
          <div className="flex flex-col gap-10 order-first md:order-last">
            <UserCard user={user} />
            <React.Suspense fallback={<>Loading...</>}>
              <Await resolve={userCourses}>
                {(userCourses) => <Statistics userCourses={userCourses} />}
              </Await>
            </React.Suspense>
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
