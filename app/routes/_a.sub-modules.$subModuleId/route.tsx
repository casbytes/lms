import React from "react";
import { LoaderFunctionArgs, defer } from "@remix-run/node";
import { Await, useLoaderData } from "@remix-run/react";
import {
  getCheckpoint,
  getLessonContent,
  getLessons,
  getSubModule,
  getTest,
  getTypeformUrl,
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
import { getVideoSource } from "~/utils/helpers.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const lessons = getLessons(request, params);
  const currentLesson = getLessonContent(request, params);
  const videoSource = getVideoSource();
  const test = await getTest(request, params);
  const checkpoint = await getCheckpoint(request, params);
  const subModule = await getSubModule(request, params);
  const type = await getTypeformUrl(request);
  return defer({
    lessons,
    currentLesson,
    subModule,
    test,
    checkpoint,
    type,
    videoSource,
  });
}

export default function ModulesRoute() {
  const {
    lessons,
    currentLesson,
    subModule,
    test,
    checkpoint,
    type,
    videoSource,
  } = useLoaderData<typeof loader>();

  const redirectUrl =
    type && type === "module"
      ? `/modules/${subModule?.moduleProgressId}`
      : `/courses/${subModule?.moduleProgress?.courseProgressId}?moduleId=${subModule?.moduleProgressId}`;

  const defaultTitle = "Matters choke!";
  const title = subModule?.title ?? defaultTitle;
  const buttonText = subModule?.moduleProgress?.title;

  const item = { test, checkpoint };

  return (
    <Container className="max-w-3xl lg:max-w-7xl">
      {subModule?.moduleProgress ? (
        <BackButton to={redirectUrl} buttonText={buttonText} />
      ) : null}
      <PageTitle title={title} className="mb-8" />
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
                      <IFrame
                        src={videoSource}
                        videoId={currentLesson.mdx.data.videoId}
                      />
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
                  <Pagination currentLessonData={currentLesson} />
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
