import React from "react";
import { ActionFunctionArgs, LoaderFunctionArgs, defer } from "@remix-run/node";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { useActionData, useLoaderData } from "@remix-run/react";
import { MembershipCard } from "~/components/membership-card";
import { DiscordCard } from "~/components/discord-card";
import { UserCard } from "./components/user-card";
import { Chart } from "./components/chart";
import {
  getLearningTime,
  getUserCourses,
  getUserModules,
  handleActions,
} from "./utils.server";
import { getUser } from "~/utils/session.server";
import { toast } from "~/components/ui/use-toast";
import { metaFn } from "~/utils/meta";
import { UserCourses } from "./components/user-courses";
import { UserModules } from "./components/user-modules";

export const meta = metaFn;

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // const courseData = getCourses(request);
    // const moduleData = getModules(request);
    const userCourses = getUserCourses(request);
    const userModules = getUserModules(request);
    const timeData = getLearningTime(request);
    const user = await getUser(request);

    return defer({
      userCourses,
      userModules,
      timeData,
      user,
    });
  } catch (error) {
    throw error;
  }
}

export async function action({ request }: ActionFunctionArgs) {
  return await handleActions(request);
}

export default function Dashboard() {
  const { userCourses, userModules, timeData, user } =
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
      <div className="lg:px-8 max-w-7xl mx-auto">
        <PageTitle title="Dashboard" className="mb-12" />
        <div className="flex flex-col gap-4 -mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <UserCard user={user} />
            {/* <Courses courseData={courseData} /> */}
            {/* <Modules moduleData={moduleData} user={user} /> */}
            <UserCourses userCourses={userCourses} />
            <UserModules userModules={userModules} />
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <MembershipCard user={user} />
            <DiscordCard user={user} />
          </div>

          <div className="grid grid-cols-1 h-auto md:h-48">
            <Chart timeData={timeData} />
          </div>
        </div>
      </div>
    </Container>
  );
}
