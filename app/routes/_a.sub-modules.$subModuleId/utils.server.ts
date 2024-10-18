import invariant from "tiny-invariant";
import matter from "gray-matter";
import type { Lesson, MDX, Module, SubModule, Test } from "~/utils/db.server";
import { Params } from "@remix-run/react";
import { getContentFromGithub } from "~/utils/octokit.server";
import { getUserId } from "~/utils/session.server";
import { prisma } from "~/utils/db.server";
import { Redis as Cache } from "~/utils/redis.server";
import { STATUS, TEST_STATUS } from "~/utils/helpers";
import { ensurePrimary } from "litefs-js/remix";
import { addReview } from "~/utils/helpers.server";

const MODE = process.env.NODE_ENV;

/**
 * Get sub module by given ID
 * @param {Request} request - Request
 * @param {Params<string>} params - Params
 * @returns {Promise<types.SubModule>}
 */
export async function getSubModule(request: Request, params: Params<string>) {
  try {
    invariant(params.subModuleId, "Submodule ID is required.");
    const subModuleId = params.subModuleId;
    const userId = await getUserId(request);
    return await prisma.subModule.findFirstOrThrow({
      where: {
        id: subModuleId,
        users: { some: { id: userId } },
      },
      include: {
        module: true,
      },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get sub module test by given submodule ID
 * @param {Request} request
 * @param {Params<string>} params
 * @returns {Promise<Test>}
 */
export async function getTest(
  request: Request,
  params: Params<string>
): Promise<Test | null> {
  try {
    invariant(params.subModuleId, "Submodule ID is required.");
    const subModuleId = params.subModuleId;
    const userId = await getUserId(request);
    const test = await prisma.test.findFirst({
      where: {
        subModuleId: subModuleId,
        users: { some: { id: userId } },
      },
    });
    if (!test) {
      return null;
    }
    return test;
  } catch (error) {
    throw error;
  }
}

/**
 * Get sub module checkpoint by given submodule ID
 * @param {Request} request
 * @param {Params<string>} params
 * @returns {Promise<types.Checkpoint>}
 */
export async function getCheckpoint(request: Request, params: Params<string>) {
  try {
    invariant(params.subModuleId, "Submodule ID is required.");
    const subModuleId = params.subModuleId;
    const userId = await getUserId(request);
    const checkpoint = await prisma.checkpoint.findFirst({
      where: {
        subModuleId: subModuleId,
        users: { some: { id: userId } },
      },
    });
    if (!checkpoint) {
      return null;
    }
    return checkpoint;
  } catch (error) {
    throw error;
  }
}

/**
 * Get subModule lessons
 * @param {Request} request
 * @param {Params<string>} params
 * @returns {Promise<Lesson[]>}
 */
export async function getLessons(
  request: Request,
  params: Params<string>
): Promise<Lesson[]> {
  invariant(params.subModuleId, "Submodule ID is required to fetch lessons.");
  const subModuleId = params.subModuleId;
  try {
    const userId = await getUserId(request);
    const firstLesson = await prisma.lesson.findFirstOrThrow({
      where: {
        subModuleId: subModuleId,
        users: { some: { id: userId } },
      },
      select: { id: true, status: true },
      orderBy: { order: "asc" },
    });

    await updateFirstLessonStatus(userId, firstLesson);
    const lessons = await prisma.lesson.findMany({
      where: {
        subModuleId,
        users: { some: { id: userId } },
      },
      orderBy: { order: "asc" },
    });
    return lessons;
  } catch (error) {
    throw error;
  }
}

/**
 * Update the status of the first lesson to in progress if it is locked
 * @param {String} userId - User ID
 * @param {ILesson} lesson - Lesson
 * @returns {Promise<ILesson>} - Promise
 */
async function updateFirstLessonStatus(
  userId: string,
  lesson: { id: string; status: string }
): Promise<Lesson | void> {
  if (MODE === "production") {
    await ensurePrimary();
  }
  if (lesson.status !== STATUS.LOCKED) {
    return;
  }
  try {
    return await prisma.lesson.update({
      where: {
        id: lesson.id,
        users: { some: { id: userId } },
        order: { equals: 1 },
      },
      data: {
        status: STATUS.IN_PROGRESS,
      },
    });
  } catch (error) {
    throw error;
  }
}

export type LessonWithModule = Lesson & {
  subModule: SubModule & {
    module: Module;
  };
};

/**
 * Get lessons content from Github by given submodule ID and lesson slug
 * @param {Request} request
 * @param {Params<string>} params
 * @returns {Promise<{mdx: MDX, previousLesson: ILesson | null, currentLesson: ILesson, nextLesson: ILesson | null}>}
 */
export async function getLesson(
  request: Request,
  params: Params<string>
): Promise<{
  mdx: MDX;
  previousLesson: Lesson | null;
  currentLesson: LessonWithModule;
  nextLesson: Lesson | null;
}> {
  try {
    invariant(params.subModuleId, "Submodule ID is required to fetch lessons.");
    const subModuleId = params.subModuleId;
    const lessonId = getLessonId(request);
    const userId = await getUserId(request);

    const currentLesson = await prisma.lesson.findFirstOrThrow({
      where: {
        subModuleId: subModuleId,
        users: { some: { id: userId } },
        ...(lessonId && { id: lessonId }),
      },
      include: {
        subModule: {
          include: {
            module: true,
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    const [previousLesson, nextLesson] = await getPreviousAndNextLessons(
      userId,
      subModuleId,
      currentLesson
    );

    const lessonData = {
      previousLesson,
      currentLesson,
      nextLesson,
    };

    const cacheKey = `lesson-${currentLesson.id}`;

    const cachedLesson = await Cache.get<MDX>(cacheKey);
    if (cachedLesson) {
      return {
        mdx: cachedLesson,
        ...lessonData,
      };
    }
    /**
     * Fetch lesson content from Github
     * The repo name is the slug of the associated module progress
     * Path: subModuleSlug/lessons/lessonSlug.mdx
     */
    const repo = currentLesson!.subModule.module.slug;
    const path = `${currentLesson!.subModule.slug}/lessons/${
      currentLesson!.slug
    }.mdx`;

    const { content: mdxContent } = await getContentFromGithub({
      repo,
      path,
    });
    const { data, content } = matter(mdxContent);
    await Cache.set<MDX>(cacheKey, { data, content });
    return {
      mdx: { data, content },
      ...lessonData,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Get previous and next lessons of a current lesson
 * @param {String} subModuleId - Submodule ID
 * @param {ILesson} currentLesson - Current lesson
 * @param {Request} request - Request
 * @returns {Promise<Array<ILesson|null>>}
 */
async function getPreviousAndNextLessons(
  userId: string,
  subModuleId: string,
  currentLesson: Lesson
): Promise<Array<Lesson | null>> {
  try {
    return Promise.all([
      prisma.lesson.findFirst({
        where: {
          subModuleId: subModuleId,
          users: { some: { id: userId } },
          order: { equals: currentLesson.order - 1 },
        },
        orderBy: {
          order: "asc",
        },
        include: {
          subModule: {
            include: {
              module: true,
            },
          },
        },
      }),
      prisma.lesson.findFirst({
        where: {
          subModuleId: subModuleId,
          users: { some: { id: userId } },
          order: { equals: currentLesson.order + 1 },
        },
        include: {
          subModule: {
            include: {
              module: true,
            },
          },
        },
      }),
    ]);
  } catch (error) {
    throw error;
  }
}

/**
 * Get lesson slug
 * @param {Request} request
 * @returns {String | undefined}
 */
function getLessonId(request: Request): string | undefined {
  const url = new URL(request.url);
  return new URLSearchParams(url.search).get("lessonId") ?? undefined;
}

//##########
//ACTIONS
//##########

export async function handleActions(request: Request, params: Params<string>) {
  const formData = await request.formData();
  const userId = await getUserId(request);
  const intent = formData.get("intent") as string;
  if (intent === "review") {
    return await addReview(formData, userId);
  } else {
    return await updateLesson(formData, params, userId);
  }
}
/**
 * Update lessons accordingly
 * @param request - request
 * @param params - params
 * @returns {null}
 */
export async function updateLesson(
  formData: FormData,
  params: Params<string>,
  userId: string
) {
  const lessonId = formData.get("lessonId") as string;
  const subModuleId = params.subModuleId;
  invariant(subModuleId, "Submodule ID is required.");
  invariant(lessonId, "Lesson ID is required to update lesson");

  try {
    const currentLesson = await prisma.lesson.findUniqueOrThrow({
      where: { id: lessonId },
      select: { id: true, order: true, status: true },
    });
    const nextLesson = await prisma.lesson.findFirst({
      where: {
        subModuleId: subModuleId,
        order: { gt: currentLesson.order },
      },
      orderBy: {
        order: "asc",
      },
    });

    if (currentLesson.status === STATUS.IN_PROGRESS) {
      await prisma.lesson.update({
        where: { id: currentLesson.id },
        data: { status: STATUS.COMPLETED },
      });

      if (nextLesson) {
        if (nextLesson.status === STATUS.LOCKED) {
          await prisma.lesson.update({
            where: { id: nextLesson.id },
            data: { status: STATUS.IN_PROGRESS },
          });
        }
      } else {
        const subModuleTest = await prisma.test.findFirstOrThrow({
          where: {
            subModuleId,
            users: { some: { id: userId } },
          },
          select: { id: true },
        });
        await prisma.test.update({
          where: { id: subModuleTest.id },
          data: { status: TEST_STATUS.AVAILABLE },
        });
      }
    }
    return null;
  } catch (error) {
    throw error;
  }
}
