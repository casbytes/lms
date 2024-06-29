import { Params } from "@remix-run/react";
import matter from "gray-matter";
import invariant from "tiny-invariant";
import { InternalServerError, NotFoundError } from "~/errors";
import { prisma } from "~/utils/db.server";
import { getContentFromGithub } from "~/utils/octokit.server";
import { getUserId } from "~/utils/session.server";

export async function getProject(request: Request, params: Params<string>) {
  const projectId = params.projectId;
  try {
    invariant(projectId, "Project ID is required to get Project");
    const userId = await getUserId(request);
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        contributors: { some: { id: userId } },
      },
      include: {
        links: true,
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
