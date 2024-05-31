import React from "react";
import { LoaderFunctionArgs, defer } from "@remix-run/node";
import { Await, useLoaderData } from "@remix-run/react";
import { cacheOptions } from "../sessions.server";
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

export async function loader({ request, params }: LoaderFunctionArgs) {
  const lessons = getLessons(request, params);
  const lessonContent = getLessonContent(request, params);
  const subModule = await getSubModule(request, params);
  return defer({ lessons, lessonContent, subModule }, cacheOptions);
}

export default function ModulesRoute() {
  const { lessons, lessonContent, subModule } = useLoaderData<typeof loader>();

  return (
    <Container className="max-w-3xl lg:max-w-7xl">
      {subModule?.moduleProgress ? (
        <BackButton to="#" buttonText={subModule.moduleProgress.title} />
      ) : null}
      <PageTitle
        title={subModule?.title ?? "Matters choke!"}
        className="mb-8"
      />
      <div className="lg:grid lg:grid-cols md:grid-cols-6 gap-6">
        <div className="col-span-4 flex flex-col gap-6 overflow-y-auto h-auto max-h-screen">
          <div className="col-span-3 min-h-full">
            {/* <React.Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center rounded-md bg-slate-300 animate-pulse">
                  <PiSpinnerGap size={100} className="animate-spin" />
                </div>
              }
            >
              <Await resolve={lessonContent}>
                {(lessonContent) => (
                  <>
                    <Markdown source={lessonContent.content} />
                    {lessonContent?.data?.videoId ? (
                      <VideoIframe
                        className="mt-8"
                        videoId={lessonContent.data.videoId}
                      />
                    ) : null}
                  </>
                )}
              </Await>
            </React.Suspense> */}

            <Separator className="h-1 bg-slate-600" />
            <Pagination />
          </div>
        </div>

        {/* mobile screens */}
        <SheetContent className="lg:hidden overflow-y-auto w-full sm:w-auto">
          <ModuleSideContent lessons={lessons} subModule={subModule} />
        </SheetContent>

        {/* large screens */}
        <aside className="hidden lg:block col-span-2 border bg-zinc-100 max-h-screen overflow-y-auto">
          <ModuleSideContent lessons={lessons} subModule={subModule} />
        </aside>
      </div>
    </Container>
  );
}
