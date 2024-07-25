import { json, useActionData, useLoaderData } from "@remix-run/react";
import { BackButton } from "~/components/back-button";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { getProject } from "./utils.server";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Markdown } from "~/components/markdown";
import { IFrame } from "~/components/iframe";
import { getUser } from "~/utils/session.server";
import { TaskPopover, TaskTable } from "~/components/task";
import { getVideoSource } from "~/utils/helpers.server";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { metaFn } from "~/utils/meta";

export const meta = metaFn;

export async function loader({ request, params }: LoaderFunctionArgs) {
  const videoSource = getVideoSource();
  const [user, projectItems] = await Promise.all([
    getUser(request),
    getProject(request, params),
  ]);
  const { project, projectContent } = projectItems;
  return json({ project, projectContent, videoSource, user });
}

export async function action() {
  return json({ some: "data" });
}

export default function ProjectRoute() {
  const { project, projectContent, videoSource, user } =
    useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();

  const projectTitle = project.title ?? "Matters choke!";
  return (
    <Container className="max-w-5xl">
      <PageTitle title={projectTitle} />
      <BackButton
        to="/dashboard"
        buttonText="Back to Dashboard"
        className="mt-4"
      />
      <>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="task-details" className="mb-4">
            <AccordionTrigger className="text-lg bg-zinc-300 p-2 rounded-md text-blue-600">
              Status and links
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <TaskTable task={project} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Markdown source={projectContent.mdx} />
        {projectContent?.data?.videoId ? (
          <IFrame src={videoSource} videoId={projectContent.data.videoId} />
        ) : null}
      </>
      <TaskPopover task={project} user={user} userId={user.id} />
    </Container>
  );
}
