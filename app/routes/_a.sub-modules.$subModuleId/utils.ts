import invariant from "tiny-invariant";
import { Params } from "@remix-run/react";
import { InternalServerError } from "~/errors";
import { getContentFromGithub } from "~/utils/octokit.server";
import { getUser } from "../sessions.server";
import { prisma } from "~/libs/prisma.server";
import matter from "gray-matter";

/**
 * Get module by given ID
 * @param {Request} request
 * @param {Params<string>} params
 * @returns {SubModuleProgress}
 */
export async function getSubModule(request: Request, params: Params<string>) {
  invariant(params.subModuleId, "Submodule ID is required.");
  const subModuleId = params.subModuleId;
  try {
    const user = await getUser(request);
    return prisma.subModuleProgress.findFirst({
      where: {
        id: subModuleId,
        users: { some: { id: user.id } },
      },
      include: {
        test: true,
        checkpoint: true,
        moduleProgress: {
          select: {
            title: true,
          },
        },
      },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get subModule lessons
 * @param {Request} request
 * @param {Params<string>} params
 * @returns {Lessons}
 */
export async function getLessons(request: Request, params: Params<string>) {
  invariant(params.subModuleId, "Submodule ID is required to fetch lessons.");
  const subModuleId = params.subModuleId;

  try {
    const user = await getUser(request);

    return prisma.lessonProgress.findMany({
      where: {
        subModuleProgressId: subModuleId,
        users: { some: { id: user.id } },
      },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get lessons content from Github by given submodule ID and lesson slug
 * @param {Request} request
 * @param {Params<string>} params
 * @returns {Promise<string>}
 */
export async function getLessonContent(
  request: Request,
  params: Params<string>
): Promise<any> {
  try {
    invariant(params.subModuleId, "Submodule ID is required to fetch lessons.");
    const subModuleId = params.subModuleId;
    const user = await getUser(request);
    const lessonSlug = getLessonSlug(request);
    const lesson = await prisma.lessonProgress.findFirst({
      where: {
        subModuleProgressId: subModuleId,
        users: { some: { id: user.id } },
        ...(lessonSlug && { slug: lessonSlug }),
      },
      include: {
        subModuleProgress: {
          include: {
            moduleProgress: true,
          },
        },
      },
    });

    const { content } = await getContentFromGithub({
      repo: `${lesson!.subModuleProgress.moduleProgress.slug}`,
      path: `${lesson!.subModuleProgress.slug}/lessons/${lesson!.slug}.mdx`,
    });
    return matter(content);
  } catch (error) {
    throw new InternalServerError(
      "An error occured while fetching lesson content."
    );
  }
}

/**
 * Get lesson slug
 * @param {Request} request
 * @returns {String | undefined}
 */
function getLessonSlug(request: Request): string | undefined {
  const url = new URL(request.url);
  const lessonSearch = new URLSearchParams(url.search);
  let lessonSlug = lessonSearch.get("lessonSlug") ?? undefined;
  return lessonSlug;
}
