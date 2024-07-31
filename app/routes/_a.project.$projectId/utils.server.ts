import { Params } from "@remix-run/react";
import matter from "gray-matter";
import invariant from "tiny-invariant";
import { prisma } from "~/utils/db.server";
import { getContentFromGithub } from "~/utils/octokit.server";
import { getUserId } from "~/utils/session.server";
import { cache } from "~/utils/node-cache.server";

export async function getProject(request: Request, params: Params<string>) {
  const projectId = params.projectId;
  const cacheKey = `project-${projectId}`;
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
      throw new Error("Project not found.");
    }

    type ProjectContent = {
      data: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
      };
      mdx: string;
    };

    if (cache.has(cacheKey)) {
      return { project, projectContent: cache.get(cacheKey) as ProjectContent };
    }
    const repo = "meta";
    const path = `course-projects/${project.courseProgress.slug}.mdx`;
    const { content } = await getContentFromGithub({
      repo,
      path,
    });

    const { data, content: mdx } = matter(content);
    cache.set<ProjectContent>(cacheKey, { data, mdx });
    return { project, projectContent: { data, mdx } };
  } catch (error) {
    throw error;
  }
}
