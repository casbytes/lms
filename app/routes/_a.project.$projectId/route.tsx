import {
  json,
  useActionData,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";
import React from "react";
import { HiOutlineDocumentAdd } from "react-icons/hi";
import { BackButton } from "~/components/back-button";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { Button } from "~/components/ui/button";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import { useLocalStorageState } from "~/utils/hooks";
import { ProjectDialog } from "./components/project-dialog";
import { getProject } from "./utils.server";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Markdown } from "~/components/markdown";
import { IFrame } from "~/components/iframe";
import { getUser } from "~/services/sessions.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { BUNNY_IFRAME_URL: iframeUrl, BUNNY_VIDEO_LIBRARY_ID: libraryId } =
    process.env as Record<string, string>;
  const videoSource = `${iframeUrl}/embed/${Number(libraryId)}`;
  const user = await getUser(request);
  const { project, projectContent } = await getProject(request, params);
  return json({ project, projectContent, videoSource, user });
}

export async function action() {
  return json({ some: "data" });
}

export default function ProjectRoute() {
  const { project, projectContent, videoSource, user } =
    useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();
  const [links, setLinks] = useLocalStorageState<string[]>("projectLinks", []);

  const submit = useSubmit();

  function handleSubmit() {
    submit(
      {
        links,
        userId: user.id,
        intent: "submit",
        projectId: project.id,
        courseProgressId: project.courseProgressId,
      },
      { method: "POST" }
    );
  }

  const projectTitle = project.title ?? "Matters choke!";
  return (
    <Container className="max-w-5xl">
      <PageTitle title={projectTitle} />
      <BackButton
        to="/dashboard"
        buttonText="Back to Dashboard"
        className="mt-4"
      />
      <Dialog>
        <>
          <Markdown source={projectContent.mdx} />
          {projectContent?.data?.videoId ? (
            <IFrame src={videoSource} videoId={projectContent.data.videoId} />
          ) : null}
        </>
        <Button
          className="rounded-full fixed bottom-5 right-5 md:bottom-10 md:right-10 drop-shadow-2xl px-5 py-10"
          asChild
        >
          <DialogTrigger>
            <HiOutlineDocumentAdd size={40} />
          </DialogTrigger>
        </Button>
        <ProjectDialog
          links={links}
          setLinks={setLinks}
          handleSubmit={handleSubmit}
        />
      </Dialog>
    </Container>
  );
}
