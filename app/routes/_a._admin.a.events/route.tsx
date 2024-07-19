import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Container } from "~/components/container";
import { AddEventDialog, EventTable } from "~/components/event";
import { PageTitle } from "~/components/page-title";
import { prisma } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const [user, events] = await Promise.all([
    getUser(request),
    prisma.event.findMany(),
  ]);
  return json({ user, events });
}

export async function action({ request }: ActionFunctionArgs) {
  return null;
}

export default function AdminEventsRoute() {
  const { user, events } = useLoaderData<typeof loader>();

  return (
    <Container className="max-w-4xl">
      <PageTitle title="events" />
      {/* @ts-ignore */}
      <EventTable events={events} user={user} />
      {user.role === "ADMIN" || user.role === "MODERATOR" ? (
        <AddEventDialog user={user} />
      ) : null}
    </Container>
  );
}
