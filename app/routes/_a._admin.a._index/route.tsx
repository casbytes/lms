import { GrStorage } from "react-icons/gr";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { DashboardCard } from "./components/dashboard-card";
import { LoaderFunctionArgs } from "@remix-run/node";
import { getCacheStats } from "~/utils/cache.server";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "~/utils/db.server";
import { IoMdPeople } from "react-icons/io";
import { PiSubtitles } from "react-icons/pi";
import { getMetaCourses, getMetaModules } from "~/services/sanity/index.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const cacheStats = getCacheStats();
  const totalUsers = await prisma.user.count();
  const subscriptions = await prisma.user.count({
    where: { subscribed: true },
  });
  const courses = await getMetaCourses();
  const modules = await getMetaModules();
  return { cacheStats, totalUsers, subscriptions, courses, modules };
}

export default function AdminDashboardRoute() {
  const { cacheStats, totalUsers, subscriptions, courses, modules } =
    useLoaderData<typeof loader>();
  return (
    <Container className="bg-2 bg-no-repeat">
      <div className="max-w-5xl mx-auto">
        <PageTitle title="Admin dashboard" />
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4 mt-8">
          <DashboardCard
            cardTitle="Total users"
            cardIcon={<IoMdPeople className="h-4 w-4 text-muted-foreground" />}
            cardContent={
              <div>
                <div className="text-2xl font-bold">{totalUsers}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </div>
            }
          />
          <DashboardCard
            cardTitle="Subscriptions"
            cardIcon={<PiSubtitles className="h-4 w-4 text-muted-foreground" />}
            cardContent={
              <div className="text-2xl font-bold">{subscriptions}</div>
            }
          />
          <DashboardCard
            cardTitle="Cache"
            cardIcon={<GrStorage className="h-4 w-4 text-muted-foreground" />}
            cardContent={
              <ul className="grid grid-cols-2 text-xs">
                {Object.entries(cacheStats).map(([key, value], index) => (
                  <li key={index}>
                    {key}: {value}
                  </li>
                ))}
              </ul>
            }
          />
          <DashboardCard
            cardTitle="Courses"
            cardIcon={<PiSubtitles className="h-4 w-4 text-muted-foreground" />}
            cardContent={
              <div className="text-2xl font-bold">{courses.length}</div>
            }
          />
          <DashboardCard
            cardTitle="Modules"
            cardIcon={<PiSubtitles className="h-4 w-4 text-muted-foreground" />}
            cardContent={
              <div className="text-2xl font-bold">{modules.length}</div>
            }
          />
        </div>
      </div>
    </Container>
  );
}
