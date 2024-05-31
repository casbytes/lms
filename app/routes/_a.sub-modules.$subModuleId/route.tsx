import React from "react";
import { BackButton } from "~/components/back-button";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { Pagination } from "~/components/pagination";
import { SheetContent } from "~/components/ui/sheet";
import { ModuleSideContent } from "./components/module-side-content";
import { LoaderFunctionArgs, defer, json } from "@remix-run/node";
import {
  Await,
  ClientLoaderFunctionArgs,
  Params,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import { Markdown } from "~/components/markdown";
import { cacheOptions, getUser } from "../sessions.server";
import { VideoIframe } from "~/components/video-iframe";
import { BadRequestError, InternalServerError } from "~/errors";
import { getLessonContent, getLessons, getSubModule } from "./utils";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const lessons = getLessons(request, params);
  const lessonContent = getLessonContent(request, params);
  const subModule = await getSubModule(request, params);
  return defer({ lessons, lessonContent, subModule }, cacheOptions);
}

export default function ModulesRoute() {
  const { lessons, lessonContent, subModule } = useLoaderData<typeof loader>();
  const libraryId = "230663";

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
          <div className="col-span-3">
            {/* <React.Suspense fallback={<>loading...</>}>
              <Await resolve={lessonContent}>
                {(lessonContent) => (
                  <>
                    <Markdown source={lessonContent.content} />
                    {lessonContent?.data?.videoId ? (
                      <VideoIframe
                        className="mt-8"
                        libraryId={libraryId}
                        videoId={lessonContent.data.videoId}
                      />
                    ) : null}
                  </>
                )}
              </Await>
            </React.Suspense> */}
          </div>
          <hr />
          {/* <Pagination /> */}
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
