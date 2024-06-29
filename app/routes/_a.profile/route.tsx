import { useLoaderData } from "@remix-run/react";
import { Container } from "~/components/container";
import { DiscordCard } from "~/components/discord-card";
import { MembershipCard } from "~/components/membership-card";
import { PageTitle } from "~/components/page-title";
import { Separator } from "~/components/ui/separator";
import { AccountDetails } from "./components/account-details";
import { UserOverview } from "./components/user-overview";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Dialog } from "~/components/ui/dialog";
import { AccountDeleteDialog } from "./components/account-delete-dialog";
import { BadRequestError, InternalServerError } from "~/errors";
import { prisma } from "~/utils/db.server";
import { getUser, signOut } from "~/utils/session.server";
import { Courses } from "~/components/catalog";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const user = await getUser(request);
    const userCourses = await prisma.courseProgress.findMany({
      where: { users: { some: { id: user.id } } },
      include: { moduleProgress: true },
    });
    return json({ user, userCourses });
  } catch (error) {
    throw new InternalServerError();
  }
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const userId = String(formData.get("userId"));
  try {
    if (intent !== "deleteAccount" || !userId) {
      throw new BadRequestError("Invalid form data.");
    }

    /**
     * !Cancel subscription
     */
    /**
     * ! Delete all user courses and progress
     */
    await prisma.user.delete({
      where: { id: userId },
    });
    /**
     * !Send googbye email
     */
    return signOut(request);
  } catch (error) {
    if (error instanceof BadRequestError) throw error;
    throw new InternalServerError();
  }
}

export default function Profile() {
  const { user, userCourses } = useLoaderData<typeof loader>();
  return (
    <Container className="bg-2 bg-no-repeat">
      <div className="mx-auto max-w-5xl">
        <PageTitle title="profile" className="-mb-10" />
        <UserOverview user={user} />
        <Separator className="mt-2" />
        <div className="grid grid-cols-1 md:grid-cols-2 mx-auto gap-6 mt-8">
          <Dialog>
            <AccountDeleteDialog user={user} />
            <AccountDetails user={user} />
          </Dialog>
          <MembershipCard user={user} />
          <DiscordCard user={user} />
          <Courses userCourses={userCourses} />
        </div>
      </div>
    </Container>
  );
}
