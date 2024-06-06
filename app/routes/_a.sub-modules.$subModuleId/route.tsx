import React from "react";
import { ActionFunctionArgs, LoaderFunctionArgs, defer } from "@remix-run/node";
import { Await, useLoaderData, useRevalidator } from "@remix-run/react";
import { cacheOptions } from "~/utils/sessions.server";
import { getLessonContent, getLessons, getSubModule } from "./utils.server";
import { PiSpinnerGap } from "react-icons/pi";
import { BackButton } from "~/components/back-button";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { SheetContent } from "~/components/ui/sheet";
import { ModuleSideContent } from "./components/module-side-content";
import { Markdown } from "~/components/markdown";
import { VideoIframe } from "~/components/video-iframe";
import { Pagination } from "./components/pagination";
import { Separator } from "~/components/ui/separator";
import { Assessment } from "~/components/assessment";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { BUNNY_IFRAME_URL: iframeUrl, BUNNY_VIDEO_LIBRARY_ID: libraryId } =
    process.env as Record<string, string>;
  const videoSource = `${iframeUrl}/embed/${Number(libraryId)}`;

  const lessons = getLessons(request, params);
  const currentLesson = getLessonContent(request, params);
  const subModule = await getSubModule(request, params);

  return defer(
    { lessons, currentLesson, subModule, videoSource },
    cacheOptions
  );
}

export default function ModulesRoute() {
  const { lessons, currentLesson, subModule, videoSource } =
    useLoaderData<typeof loader>();

  const redirectUrl = `/courses/${subModule?.moduleProgress?.courseProgressId}?moduleId=${subModule?.moduleProgressId}`;
  const buttonText = subModule?.moduleProgress?.title;

  return (
    <Container className="max-w-3xl lg:max-w-7xl">
      {subModule?.moduleProgress ? (
        <BackButton to={redirectUrl} buttonText={buttonText} />
      ) : null}
      <PageTitle
        title={subModule?.title ?? "Matters choke!"}
        className="mb-8"
      />
      <div className="lg:grid lg:grid-cols md:grid-cols-6 gap-6">
        <div className="col-span-4 flex flex-col gap-6 overflow-y-auto h-auto max-h-screen">
          <div className="col-span-3 min-h-full">
            <Assessment item={subModule} />
            <Separator className="bg-sky-700 h-2 my-4 rounded-tl-md rounded-br-md" />
            <React.Suspense
              fallback={
                <div className="w-full h-auto md:h-[calc(100vh-20rem)] flex items-center justify-center rounded-md bg-black bg-opacity-80 animate-pulse">
                  <PiSpinnerGap
                    size={100}
                    className="animate-spin text-sky-300"
                  />
                </div>
              }
            >
              <Await resolve={currentLesson}>
                {(currentLesson) => (
                  <>
                    <Markdown source={currentLesson.mdx.content} />
                    {currentLesson?.mdx?.data?.videoId ? (
                      <VideoIframe
                        className="mt-8"
                        videoSource={videoSource}
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
