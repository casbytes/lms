import React from "react";
import invariant from "tiny-invariant";
import { ActionFunctionArgs, defer, LoaderFunctionArgs } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { BackButton } from "~/components/back-button";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { getMetaModules } from "~/services/sanity/index.server";
import { MetaModules } from "~/components/catalog/meta-modules";
import { getUserId } from "~/utils/session.server";
import { prisma } from "~/utils/db.server";
import { toast } from "~/components/ui/use-toast";
import { metaFn } from "~/utils/meta";
import { getCurrentCourseOrModule } from "~/utils/helpers.server";
import { addModuleToCatalog } from "~/utils/module.server";

export const meta = metaFn;

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const searchTerm = url.searchParams.get("moduleTitle");
  const userId = await getUserId(request);
  return defer({
    modules: getMetaModules({ searchTerm, userId }),
    user: await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { subscribed: true },
    }),
    currentItem: await getCurrentCourseOrModule(userId),
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const moduleId = formData.get("itemId") as string;
  const intent = formData.get("intent") as "addModuleToCatalog";
  const userId = await getUserId(request);
  invariant(intent, "Invalid form data.");
  return await addModuleToCatalog(moduleId, userId);
}

export default function CoursesCatalogRoute() {
  const { modules, user, currentItem } = useLoaderData<typeof loader>();
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
      <PageTitle title="modules" />
      <MetaModules modules={modules} user={user} currentItem={currentItem} />
    </Container>
  );
}
