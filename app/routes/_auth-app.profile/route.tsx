import { useLoaderData, useRouteError } from "@remix-run/react";
import { Container } from "~/components/container";
import { CourseCatalogCard } from "../../components/course-catalog";
import { DiscordCard } from "~/components/discord-card";
import { ErrorUI } from "~/components/error-ui";
import { MembershipCard } from "~/components/membership-card";
import { PageTitle } from "~/components/page-title";
import { Separator } from "~/components/ui/separator";
import { AccountDetails } from "./components/account-details";
import { UserOverview } from "./components/user-overview";
import { getUser, signOut } from "~/utils/session.server";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Dialog } from "~/components/ui/dialog";
import AccountDeleteDialog from "./components/account-delete-dialog";
import { prisma } from "~/libs/prisma";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const user = await getUser(request);
    return json({ user });
  } catch (error) {
    throw error;
  }
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const userId = String(formData.get("userId"));
  try {
    if (intent === "delete-account" && userId) {
      /**
       * !Cancel subscription
       */
      await prisma.user.delete({
        where: { id: userId },
      });
      /**
       * !Send googbye email
       */
      await signOut(request);
    } else {
      throw new Error("Unknown form intent.");
    }
  } catch (error) {
    throw error;
  }
}

export default function Profile() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <Container className="bg-header-2 bg-no-repeat">
      <div className="mx-auto max-w-5xl">
        <PageTitle title="profile" />
        <UserOverview user={user} />
        <Separator className="mt-2" />
        <div className="grid grid-cols-1 md:grid-cols-2 mx-auto gap-6 mt-8">
          <Dialog>
            <AccountDeleteDialog user={user} />
            <AccountDetails user={user} />
          </Dialog>
          <MembershipCard />
          <DiscordCard />
          <CourseCatalogCard />
        </div>
      </div>
    </Container>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return <ErrorUI error={error} />;
}
