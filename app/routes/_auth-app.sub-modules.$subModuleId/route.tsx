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
  useLoaderData,
} from "@remix-run/react";
import { Markdown } from "~/components/markdown";
import axios from "axios";
import { VideoIframe, DiagramIframe } from "~/components/iframes";
import { cacheOptions, getUser } from "~/utils/session.server";
import { prisma } from "~/libs/prisma";
import { getContentFromGithub } from "~/utils/octokit.server";
import invariant from "tiny-invariant";

const libraryId = "230663";

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.subModuleId, "subModule ID is required.");

  const user = await getUser(request);

  const subModuleId = params.subModuleId;

  // const url = new URL(request.url);
  // const moduleParams = new URLSearchParams(url.search);
  // const moduleId = moduleParams.get("moduleId");

  // let subModule;
  // if (!moduleId) {
  //   subModule = await prisma.lessonProgress.findFirst({
  //     where: {
  //       subModuleProgressId: subModuleId,
  //     },
  //   });
  // }

  const { userId } = await getUser(request);
  const lessons = await prisma.lessonProgress.findMany({
    where: { subModuleProgressId: subModuleId, userId },
    include: {
      subModule: {
        include: {
          module: {
            include: {
              course: true,
            },
          },
        },
      },
    },
  });

  // const content = await getContentFromGithub({
  //   repo: courseSlug as string,
  //   path: `${moduleSlug}/${subModuleSlug}/${lessons[0].slug}.mdx`,
  // });

  // console.log(content);

  // const content = lessons.

  // const data = {
  //   content: `# Javascript`,
  //   videoId: "8ee7ba95-7386-4c18-8639-6a0a185d3fe5",
  // };

  return json({ lessons }, cacheOptions);
}

export default function ModulesRoute() {
  const { lessons } = useLoaderData<typeof loader>();
  return (
    <Container className="max-w-3xl lg:max-w-7xl">
      {/* <BackButton to={`/courses/${moduleId}`} buttonText="Introduction to SE" /> */}
      <PageTitle title="Javascript" className="mb-8" />
      <div className="lg:grid lg:grid-cols md:grid-cols-6 gap-6">
        <div className="col-span-4 flex flex-col gap-6 overflow-y-auto h-auto max-h-screen">
          <div className="col-span-3">
            {/* <Markdown source={data.content} /> */}
            {/* <DiagramIframe /> */}
            {/* {data.videoId ? (
              <VideoIframe
                className="mt-8"
                libraryId={libraryId}
                videoId={data.videoId}
              />
            ) : null} */}
          </div>
          <hr />
          {/* <Pagination /> */}
        </div>

        {/* mobile screens */}
        <SheetContent className="lg:hidden overflow-y-auto w-full sm:w-auto">
          <ModuleSideContent lessons={lessons} />
        </SheetContent>

        {/* large screens */}
        <aside className="hidden lg:block col-span-2 border bg-zinc-100 max-h-screen overflow-y-auto">
          <ModuleSideContent lessons={lessons} />
        </aside>
      </div>
    </Container>
  );
}
