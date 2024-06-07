import { Params } from "@remix-run/react";
import matter from "gray-matter";
import invariant from "tiny-invariant";
import { InternalServerError, NotFoundError } from "~/errors";
import { prisma } from "~/libs/prisma.server";
import { getContentFromGithub } from "~/utils/octokit.server";
import { getUser } from "~/utils/sessions.server";

export async function getProject(request: Request, params: Params<string>) {
  const projectId = params.projectId;
  try {
    invariant(projectId, "Project ID is required to get Project");
    const user = await getUser(request);
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        contributors: { some: { id: user.id } },
      },
      include: {
        courseProgress: true,
      },
    });

    if (!project) {
      throw new NotFoundError("Project not found.");
    }

    const repo = project.courseProgress.slug;
    const path = "project.mdx";

    const { content } = await getContentFromGithub({
      repo,
      path,
    });

    const { data, content: mdx } = matter(content);
    return { project, projectContent: { data, mdx } };
  } catch (error) {
    throw new InternalServerError();
  }
}
