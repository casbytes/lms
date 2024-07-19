import React from "react";
import { ActionFunctionArgs, LoaderFunctionArgs, defer } from "@remix-run/node";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { useActionData, useLoaderData } from "@remix-run/react";
import { MembershipCard } from "~/components/membership-card";
import { DiscordCard } from "~/components/discord-card";
import { UserCard } from "./components/user-card";
import { Statistics } from "./components/user-statistics";
import {
  getCourses,
  getLearningTime,
  getUserCourses,
  getUserModules,
  handleActions,
} from "./utils.server";
import { Courses } from "./components/courses";
import { getUser } from "~/utils/session.server";
import { Modules } from "./components/modules";
import { toast } from "~/components/ui/use-toast";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const data = getCourses(request);
    const userCourses = getUserCourses(request);
    const userModules = getUserModules(request);
    const timeData = getLearningTime(request);
    const user = await getUser(request);
    return defer({ data, userCourses, userModules, timeData, user });
  } catch (error) {
    throw error;
  }
}

export async function action({ request }: ActionFunctionArgs) {
  return await handleActions(request);
}

export default function Dashboard() {
  const { data, userCourses, userModules, timeData, user } =
    useLoaderData<typeof loader>();
  const ad = useActionData<typeof action>();

  React.useEffect(() => {
    if (ad) {
      if (ad.success) {
        toast({ title: ad.message });
      } else {
        toast({ title: ad.message, variant: "destructive" });
      }
    }
  }, [ad]);

  return (
    <Container className="bg-2 bg-no-repeat">
      <div className="lg:p-8 max-w-7xl mx-auto">
        <PageTitle title="Dashboard" className="mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-4 rounded-md drop-shadow-sm">
          <div className="flex gap-10 flex-col">
            <Courses data={data} />
            <Modules data={data} user={user} />
            <DiscordCard user={user} />
          </div>
          <div className="flex flex-col gap-10 order-first md:order-last">
            <UserCard user={user} />
            <Statistics
              userCourses={userCourses}
              userModules={userModules}
              timeData={timeData}
            />
            <MembershipCard user={user} />
          </div>
        </div>
      </div>
    </Container>
  );
}
