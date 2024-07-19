import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Container } from "~/components/container";
import { EventTable } from "~/components/event";
import { PageTitle } from "~/components/page-title";
import { prisma } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const [user, events] = await Promise.all([
      getUser(request),
      prisma.event.findMany(),
    ]);
    return json({ user, events });
  } catch (error) {
    throw error;
  }
}

export default function EventsRoute() {
  const { user, events } = useLoaderData<typeof loader>();
  return (
    <Container className="max-w-4xl">
      <PageTitle title="events" />
      <EventTable events={events} user={user} />
    </Container>
  );
}
