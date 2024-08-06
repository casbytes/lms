import { Params } from "@remix-run/react";
import matter from "gray-matter";
import invariant from "tiny-invariant";
import { MDX, prisma } from "~/utils/db.server";
import { getContentFromGithub } from "~/utils/octokit.server";
import { getUserId } from "~/utils/session.server";
import { cache } from "~/utils/node-cache.server";

export async function getProject(request: Request, params: Params<string>) {
  const projectId = params.projectId;
  invariant(projectId, "Project ID is required to get Project");

  const cacheKey = `project-${projectId}`;
  try {
    const userId = await getUserId(request);
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        contributors: { some: { id: userId } },
      },
      include: {
        course: true,
      },
    });

    if (!project) {
      throw new Error("Project not found.");
    }

    if (cache.has(cacheKey)) {
      return { project, projectContent: cache.get<MDX>(cacheKey) as MDX };
    }
    const repo = "meta";
    const path = `course-projects/${project.course.slug}.mdx`;
    const { content: mdx } = await getContentFromGithub({
      repo,
      path,
    });

    const { data, content } = matter(mdx);
    cache.set<MDX>(cacheKey, { data, content });
    return { project, projectContent: { data, content } };
  } catch (error) {
    throw error;
  }
}

export async function updateProject(request: Request) {
  console.log(request);

  return null;
}
