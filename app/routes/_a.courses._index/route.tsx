import React from "react";
import invariant from "tiny-invariant";
import { ActionFunctionArgs, defer, LoaderFunctionArgs } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { BackButton } from "~/components/back-button";
import { MetaCourses } from "~/components/catalog/meta-courses";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { getMetaCourses } from "~/services/sanity/index.server";
import { getUserId } from "~/utils/session.server";
import { prisma } from "~/utils/db.server";
import { toast } from "~/components/ui/use-toast";
import { metaFn } from "~/utils/meta";
import { getCurrentCourseOrModule } from "~/utils/helpers.server";
import { addCourseToCatalog } from "~/utils/module.server";

export const meta = metaFn;

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  try {
    return defer({
      courses: getMetaCourses(),
      user: await prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: { subscribed: true },
      }),
      currentItem: await getCurrentCourseOrModule(userId),
    });
  } catch (error) {
    throw error;
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const courseId = formData.get("itemId") as string;
  const intent = formData.get("intent") as "addCourseToCatalog";
  const userId = await getUserId(request);
  invariant(intent, "Invalid form data.");
  return await addCourseToCatalog(courseId, userId);
}

export default function CourseCatalogRoute() {
  const { courses, user, currentItem } = useLoaderData<typeof loader>();
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
    <Container className="max-w-6xl">
      <BackButton to="/dashboard" buttonText="dashboard" />
      <PageTitle title="courses" className="mb-6" />
      <MetaCourses courses={courses} user={user} currentItem={currentItem} />
    </Container>
  );
}
