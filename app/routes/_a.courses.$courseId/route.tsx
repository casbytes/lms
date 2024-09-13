import React from "react";
import { useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs, defer } from "@remix-run/node";
import {
  getTest,
  getProject,
  getModule,
  getModules,
  getCheckpoint,
  getSubModules,
  getModuleBadges,
} from "./utils.server";
import { BackButton } from "~/components/back-button";
import { Container } from "~/components/container";
import { SheetContent } from "~/components/ui/sheet";
import { Separator } from "~/components/ui/separator";
import { Assessment } from "~/components/assessment";
import { CourseSideContent } from "./components/course-side-content";
import { PageTitle } from "~/components/page-title";
import { getUser } from "~/utils/session.server";
import { SubModules } from "~/components/modules";
import { metaFn } from "~/utils/meta";
import { AddReview } from "~/components/add-review";
import { prisma } from "~/utils/db.server";
import { isCourseOrModuleReviewed } from "~/utils/helpers.server";

export const meta = metaFn;

export async function loader({ request, params }: LoaderFunctionArgs) {
  const modules = getModules(request, params);
  const subModules = getSubModules(request, params);
  const badges = getModuleBadges(request, params);
  const test = await getTest(request, params);
  const checkpoint = await getCheckpoint(request, params);
  const project = await getProject(request, params);
  const module = await getModule(request, params);
  const user = await getUser(request);
  const course = await prisma.course.findUniqueOrThrow({
    where: { id: params.courseId },
  });
  const isCourseReviewed = await isCourseOrModuleReviewed({
    userId: user.id,
    courseId: course.id,
  });
  return defer({
    test,
    modules,
    checkpoint,
    subModules,
    badges,
    project,
    module,
    user,
    course,
    isCourseReviewed,
  });
}

export default function CoursesRoute() {
  const {
    test,
    modules,
    checkpoint,
    subModules,
    badges,
    project,
    module,
    user,
    course,
    isCourseReviewed,
  } = useLoaderData<typeof loader>();
  const item = { test, checkpoint };
  const [isDialogOpen, setIsDialogOpen] = React.useState(isCourseReviewed);
  return (
    <Container className="max-w-3xl lg:max-w-7xl">
      <BackButton to="/dashboard" buttonText="dashboard" />
      <PageTitle title={module.title} className="mb-8" />
      <AddReview
        user={user}
        course={course}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      />
      <div className="lg:grid lg:grid-cols lg:grid-cols-5 gap-6">
        <ul className="col-span-3 flex flex-col gap-6 overflow-y-auto h-auto max-h-screen">
          <div className="bg-[url('https://cdn.casbytes.com/assets/elearning2.png')] bg-no-repeat bg-contain">
            <div className="flex flex-col gap-6 bg-slate-100/90">
              <Assessment item={item} />
              <Separator className="bg-sky-700 h-2 rounded-tl-md rounded-br-md" />
              <SubModules
                subModules={subModules}
                isPremium={module.premium}
                user={user}
              />
            </div>
          </div>
        </ul>

        {/* mobile screens */}
        <SheetContent className="lg:hidden overflow-y-auto w-full sm:w-auto">
          <CourseSideContent
            user={user}
            badges={badges}
            project={project}
            modules={modules}
          />
        </SheetContent>
        {/* large screens */}
        <aside className="hidden lg:block col-span-2 border bg-zinc-100 overflow-y-auto max-h-screen">
          <CourseSideContent
            user={user}
            badges={badges}
            project={project}
            modules={modules}
          />
        </aside>
      </div>
    </Container>
  );
}
