import { ActionFunctionArgs, LoaderFunctionArgs, defer } from "@remix-run/node";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { useLoaderData } from "@remix-run/react";
import { MembershipCard } from "~/components/membership-card";
import { DiscordCard } from "~/components/discord-card";
import { UserCard } from "./components/user-card";
import { Statistics } from "./components/user-statistics";
import { addCourseToCatalog, getCourses, getUserCourses } from "./utils";
import { getUser } from "../sessions.server";
import { BadRequestError, InternalServerError } from "~/errors";
import { Courses } from "./components/courses";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const data = getCourses(request);
    const userCourses = getUserCourses(request);
    const user = await getUser(request);
    return defer({ data, userCourses, user });
  } catch (error) {
    throw new InternalServerError("Error getting courses.");
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const courseId = String(formData.get("courseId"));
  const { id: userId } = await getUser(request);

  try {
    if (intent !== "addCourseToCatalog") {
      throw new BadRequestError("Invalid form data.");
    }
    await addCourseToCatalog(userId, courseId);
    return null;
  } catch (error) {
    throw new InternalServerError();
  }
}

export default function Dashboard() {
  const { data, userCourses, user } = useLoaderData<typeof loader>();

  return (
    <Container className="bg-2 bg-no-repeat">
      <div className="lg:p-8 max-w-7xl mx-auto">
        <PageTitle title="Dashboard" className="mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-4 rounded-md drop-shadow-sm">
          <div className="flex gap-10 flex-col">
            <Courses data={data} />
            <DiscordCard />
          </div>
          <div className="flex flex-col gap-10 order-first md:order-last">
            <UserCard user={user} />
            <Statistics userCourses={userCourses} />
            <MembershipCard />
          </div>
        </div>
      </div>
    </Container>
  );
}
