import React from "react";
import { useActionData, useLoaderData } from "@remix-run/react";
import { Container } from "~/components/container";
import { DiscordCard } from "~/components/discord-card";
import { MembershipCard } from "~/components/membership-card";
import { PageTitle } from "~/components/page-title";
import { Separator } from "~/components/ui/separator";
import { AccountDetails } from "./components/account-details";
import { UserOverview } from "./components/user-overview";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Dialog } from "~/components/ui/dialog";
import { AccountDeleteDialog } from "./components/account-delete-dialog";
import { UpdateUserForm } from "./components/update-user-form";
import { getUser } from "~/utils/session.server";
import { toast } from "~/components/ui/use-toast";
import { handleActions } from "./utils.server";
import { metaFn } from "~/utils/meta";

export const meta = metaFn;

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    return getUser(request);
  } catch (error) {
    throw error;
  }
}

export async function action({ request }: ActionFunctionArgs) {
  return handleActions(request);
}

export default function Profile() {
  const user = useLoaderData<typeof loader>();
  const ad = useActionData<typeof action>();

  React.useEffect(() => {
    if (ad) {
      if (ad.success) {
        toast({
          title: "Profile updated",
        });
      } else {
        toast({
          title: "Error updating profile",
          variant: "destructive",
        });
      }
    }
  }, [ad]);

  return (
    <Container className="bg-2 bg-no-repeat">
      <div className="mx-auto max-w-5xl">
        <PageTitle title="profile" className="mb-8" />
        <UserOverview user={user} />
        <div className="grid grid-cols-1 md:grid-cols-2 mx-auto gap-6 mt-8">
          <Dialog>
            <AccountDeleteDialog />
            <AccountDetails user={user} />
          </Dialog>
          <UpdateUserForm user={user} />
          <DiscordCard user={user} />
          <MembershipCard user={user} />
        </div>
      </div>
    </Container>
  );
}
