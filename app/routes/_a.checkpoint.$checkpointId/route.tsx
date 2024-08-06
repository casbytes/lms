import React from "react";
import { Container } from "~/components/container";
import { Markdown } from "~/components/markdown";
import { PageTitle } from "~/components/page-title";
import { BackButton } from "~/components/back-button";
import { toast } from "~/components/ui/use-toast";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { getCheckpoint, updateCheckpoint } from "./utils.server";
import { useActionData, useLoaderData } from "@remix-run/react";
import { IFrame } from "~/components/iframe";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { getUser } from "~/utils/session.server";
import { getVideoSource } from "~/utils/helpers.server";
import { metaFn } from "~/utils/meta";

export const meta = metaFn;

export async function loader({ request, params }: LoaderFunctionArgs) {
  const videoSource = getVideoSource();
  const { checkpoint, checkpointContent } = await getCheckpoint(
    request,
    params
  );
  const user = await getUser(request);
  return json({ checkpoint, checkpointContent, user, videoSource });
}

export async function action({ request }: ActionFunctionArgs) {
  const checkpointResponse = await updateCheckpoint(request);
  return json({ checkpointResponse });
}

export default function CheckPointRoute() {
  const { checkpoint, checkpointContent, user, videoSource } =
    useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();

  // let moduleId = checkpoint?.moduleId;
  // let subModuleId = checkpoint?.subModuleId;

  const moduleTest = checkpoint?.moduleId ? true : false;
  const defaultTitle = "Matters choke!";
  const checkpointTitle = checkpoint.title ?? defaultTitle;

  const moduleOrSubModuleTitle = moduleTest
    ? checkpoint?.module?.title
    : checkpoint?.subModule?.title ?? defaultTitle;

  const moduleOrSubModuleUrl = moduleTest
    ? `/courses/${checkpoint?.module?.courseId}?moduleId=${checkpoint?.moduleId}`
    : `/sub-modules/${checkpoint?.subModuleId}`;

  React.useEffect(() => {
    if (data?.checkpointResponse) {
      const { checkpointResponse } = data;
      if (checkpointResponse.message) {
        toast({
          title: checkpointResponse.message,
        });
      } else if (checkpointResponse.error) {
        toast({
          title: checkpointResponse.error,
          variant: "destructive",
        });
      }
    }
  }, [data]);

  return (
    <Container className="max-w-4xl">
      <PageTitle title={checkpointTitle} />
      <BackButton
        to={moduleOrSubModuleUrl}
        buttonText={moduleOrSubModuleTitle}
        className="mt-4"
      />
      <>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="task-details" className="mb-4">
            <AccordionTrigger className="text-lg bg-zinc-300 p-2 rounded-md text-blue-600">
              Status and link
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <TaskTable task={checkpoint} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Markdown source={checkpointContent.mdx} />
        {checkpointContent?.data?.videoId ? (
          <IFrame src={videoSource} videoId={checkpointContent.data.videoId} />
        ) : null}
      </>
    </Container>
  );
}
