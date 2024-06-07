import React from "react";
import { Container } from "~/components/container";
import { Markdown } from "~/components/markdown";
import { PageTitle } from "~/components/page-title";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import { CheckpointDialog } from "./components/checkpoint-dialog";
import { Button } from "~/components/ui/button";
import { HiOutlineDocumentAdd } from "react-icons/hi";
import { BackButton } from "~/components/back-button";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { getUser } from "~/utils/sessions.server";
import { getCheckpoint, updateCheckpoint } from "./utils.server";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { useLocalStorageState } from "~/utils/hooks";
import { VideoIframe } from "~/components/video-iframe";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { BUNNY_IFRAME_URL: iframeUrl, BUNNY_VIDEO_LIBRARY_ID: libraryId } =
    process.env as Record<string, string>;
  const videoSource = `${iframeUrl}/embed/${Number(libraryId)}`;

  const user = await getUser(request);
  const { checkpoint, checkpointContent } = await getCheckpoint(
    request,
    params
  );
  return json({ checkpoint, checkpointContent, videoSource, user });
}

export async function action({ request }: ActionFunctionArgs) {
  const checkpointResponse = updateCheckpoint(request);
  return json({ checkpointResponse });
}

export default function CheckPointRoute() {
  const { checkpoint, checkpointContent, videoSource, user } =
    useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();

  const [links, setLinks] = useLocalStorageState<string[]>(
    "checkpointLinks",
    []
  );

  const submit = useSubmit();

  let moduleProgressId = checkpoint?.moduleProgressId;
  let subModuleProgressId = checkpoint?.subModuleProgressId;

  const moduleTest = checkpoint?.moduleProgressId ? true : false;
  const defaultTitle = "Matters choke!";
  const checkpointTitle = checkpoint.title ?? defaultTitle;

  const moduleOrSubModuleTitle = moduleTest
    ? checkpoint?.moduleProgress?.title
    : checkpoint?.subModuleProgress?.title ?? defaultTitle;

  const moduleOrSubModuleUrl = moduleTest
    ? `/courses/${checkpoint?.moduleProgress?.courseProgressId}?moduleId=${checkpoint?.moduleProgressId}`
    : `/sub-modules/${checkpoint?.subModuleProgressId}`;

  function handleSubmit() {
    submit(
      {
        links,
        userId: user.id,
        intent: "submit",
        checkpointId: checkpoint.id,
        moduleProgressId: moduleProgressId ?? null,
        subModuleProgressId: subModuleProgressId ?? null,
      },
      { method: "POST" }
    );
  }

  return (
    <Container className="max-w-5xl">
      <PageTitle title={checkpointTitle} />
      <BackButton
        to={moduleOrSubModuleUrl}
        buttonText={moduleOrSubModuleTitle}
        className="mt-4"
      />
      <Dialog>
        <div>
          <Markdown source={checkpointContent.mdx} />
          {checkpointContent?.data?.videoId ? (
            <VideoIframe
              className="mt-8"
              videoSource={videoSource}
              videoId={checkpointContent.data.videoId}
            />
          ) : null}
        </div>
        <Button
          className="rounded-full fixed bottom-5 right-5 md:bottom-10 md:right-10 drop-shadow-2xl px-5 py-10"
          asChild
        >
          <DialogTrigger>
            <HiOutlineDocumentAdd size={40} />
          </DialogTrigger>
        </Button>
        <CheckpointDialog
          links={links}
          setLinks={setLinks}
          handleSubmit={handleSubmit}
        />
      </Dialog>
    </Container>
  );
}
