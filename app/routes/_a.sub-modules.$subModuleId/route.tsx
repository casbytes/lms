import React from "react";
import { ActionFunctionArgs, LoaderFunctionArgs, defer } from "@remix-run/node";
import { Await, useLoaderData, useSearchParams } from "@remix-run/react";
import {
  getCheckpoint,
  getLesson,
  getLessons,
  getSubModule,
  getTest,
  handleActions,
} from "./utils.server";
import { BackButton } from "~/components/back-button";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { SheetContent } from "~/components/ui/sheet";
import { ModuleSideContent } from "./components/module-side-content";
import { Markdown } from "~/components/markdown";
import { IFrame } from "~/components/iframe";
import { Pagination } from "./components/pagination";
import { Separator } from "~/components/ui/separator";
import { Assessment } from "~/components/assessment";
import { ContentPendingUI } from "~/components/content-pending-ui";
import { metaFn } from "~/utils/meta";
import { AddReview } from "~/components/add-review";
import { getUser } from "~/utils/session.server";
import { isCourseOrModuleReviewed } from "~/utils/helpers.server";

export const meta = metaFn;

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const lessons = getLessons(request, params);
    const currentLesson = getLesson(request, params);
    const test = await getTest(request, params);
    const checkpoint = await getCheckpoint(request, params);
    const subModule = await getSubModule(request, params);
    const user = await getUser(request);
    const isModuleReviewed = await isCourseOrModuleReviewed({
      userId: user.id,
      moduleId: subModule.moduleId,
    });

    return defer({
      lessons,
      currentLesson,
      subModule,
      test,
      checkpoint,
      user,
      isModuleReviewed,
    });
  } catch (error) {
    throw error;
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  try {
    return await handleActions(request, params);
  } catch (error) {
    throw error;
  }
}

export default function ModulesRoute() {
  const {
    lessons,
    currentLesson,
    subModule,
    test,
    checkpoint,
    user,
    isModuleReviewed,
  } = useLoaderData<typeof loader>();
  const [isDialogOpen, setIsDialogOpen] = React.useState(isModuleReviewed);
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");

  const redirectUrl =
    type && type === "module"
      ? `/modules/${subModule?.moduleId}`
      : `/courses/${subModule?.module?.courseId}?moduleId=${subModule?.moduleId}`;

  const title = subModule.title;
  const buttonText = subModule.module.title;
  const item = { test, checkpoint };

  return (
    <Container className="max-w-3xl lg:max-w-7xl">
      <BackButton to={redirectUrl} buttonText={buttonText} />
      <PageTitle title={title} className="mb-8" />
      <AddReview
        user={user}
        module={subModule.module}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      />
      <div className="lg:grid lg:grid-cols md:grid-cols-6 gap-6">
        <div className="col-span-4 flex flex-col gap-6 overflow-y-auto h-auto max-h-screen">
          <div className="col-span-3 min-h-full">
            <Assessment item={item} />
            <Separator className="bg-sky-700 h-2 my-4 rounded-tl-md rounded-br-md" />
            <React.Suspense fallback={<ContentPendingUI />}>
              <Await resolve={currentLesson}>
                {(currentLesson) => (
                  <>
                    <Markdown source={currentLesson.mdx.content} />
                    {currentLesson?.mdx?.data?.videoId ? (
                      <IFrame videoId={currentLesson.mdx.data.videoId} />
                    ) : null}
                  </>
                )}
              </Await>
            </React.Suspense>
            <Separator className="bg-sky-700 h-2 my-4 rounded-tl-md rounded-br-md" />

            <React.Suspense
              fallback={
                <div className="w-full h-8 rounded-md bg-black bg-opacity-80 animate-pulse" />
              }
            >
              <Await resolve={currentLesson}>
                {(currentLesson) => (
                  <Pagination
                    currentLessonData={currentLesson}
                    redirectUrl={redirectUrl}
                  />
                )}
              </Await>
            </React.Suspense>
          </div>
        </div>

        {/* mobile screens */}
        <SheetContent className="lg:hidden overflow-y-auto w-full sm:w-auto">
          <ModuleSideContent lessons={lessons} />
        </SheetContent>

        {/* large screens */}
        <aside className="hidden lg:block col-span-2 border bg-zinc-100 h-auto max-h-screen overflow-y-auto">
          <ModuleSideContent lessons={lessons} />
        </aside>
      </div>
    </Container>
  );
}
