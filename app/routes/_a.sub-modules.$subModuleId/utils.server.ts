import invariant from "tiny-invariant";
import matter from "gray-matter";
import type { LessonProgress, Test } from "~/utils/db.server";
import { Params } from "@remix-run/react";
import { getContentFromGithub } from "~/utils/octokit.server";
import { getUserId } from "~/utils/session.server";
import { prisma } from "~/utils/db.server";
import { Status, TestStatus } from "~/constants/enums";

/**
 * Get sub module by given ID
 * @param {Request} request - Request
 * @param {Params<string>} params - Params
 * @returns {Promise<types.SubModuleProgress>}
 */
export async function getSubModule(request: Request, params: Params<string>) {
  try {
    invariant(params.subModuleId, "Submodule ID is required.");
    const subModuleId = params.subModuleId;
    const userId = await getUserId(request);
    const subModule = await prisma.subModuleProgress.findFirst({
      where: {
        id: subModuleId,
        users: { some: { id: userId } },
      },
      include: {
        moduleProgress: true,
      },
    });
    if (!subModule) {
      throw new Error("Sub module not found.");
    }
    return subModule;
  } catch (error) {
    console.error(error);
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
): Promise<Test> {
  try {
    invariant(params.subModuleId, "Submodule ID is required.");
    const subModuleId = params.subModuleId;
    const userId = await getUserId(request);
    const test = await prisma.test.findFirst({
      where: {
        subModuleProgressId: subModuleId,
        users: { some: { id: userId } },
      },
    });
    if (!test) {
      throw new Error("Test not found.");
    }
    return test;
  } catch (error) {
    console.error(error);
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
        subModuleProgressId: subModuleId,
        users: { some: { id: userId } },
      },
    });
    if (!checkpoint) {
      throw new Error("Checkpoint not found.");
    }
    return checkpoint;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Get subModule lessons
 * @param {Request} request
 * @param {Params<string>} params
 * @returns {Promise<types.LessonProgress[]>}
 */
export async function getLessons(
  request: Request,
  params: Params<string>
): Promise<LessonProgress[]> {
  invariant(params.subModuleId, "Submodule ID is required to fetch lessons.");
  const subModuleId = params.subModuleId;

  try {
    const userId = await getUserId(request);
    /**
     * Fetch the first lesson of the sub module
     * to update its status to in progress if it is locked
     */
    const firstLesson = await prisma.lessonProgress.findFirst({
      where: {
        subModuleProgressId: subModuleId,
        users: { some: { id: userId } },
      },
      orderBy: {
        order: "asc",
      },
    });

    if (!firstLesson) {
      throw new Error("First lesson not found.");
    }

    const [lessons] = await Promise.all([
      prisma.lessonProgress.findMany({
        where: {
          subModuleProgressId: subModuleId,
          users: { some: { id: userId } },
        },
        orderBy: {
          order: "asc",
        },
      }),
      /**
       * Update the status of the first lesson to in progress if it is locked
       */
      updateFirstLessonStatus(userId, firstLesson),
    ]);
    return lessons;
  } catch (error) {
    console.error(error);
    throw error;
    // throw new InternalServerError(
    //   "An error occured while fetching lessons, please try again."
    // );
  }
}

/**
 * Update the status of the first lesson to in progress if it is locked
 * @param {String} userId - User ID
 * @param {ILessonProgress} lessonProgress - Lesson Progress
 * @returns {Promise<ILessonProgress>} - Promise
 */
async function updateFirstLessonStatus(
  userId: string,
  lessonProgress: LessonProgress
): Promise<LessonProgress | void> {
  if (lessonProgress.status !== Status.LOCKED) {
    return;
  }
  return prisma.lessonProgress.update({
    where: {
      id: lessonProgress.id,
      users: { some: { id: userId } },
    },
    data: {
      status: Status.IN_PROGRESS,
    },
  });
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
    const lessonSlug = getLessonSlug(request);
    const userId = await getUserId(request);

    const currentLesson = await prisma.lessonProgress.findFirst({
      where: {
        subModuleProgressId: subModuleId,
        users: { some: { id: userId } },
        ...(lessonSlug && { slug: lessonSlug }),
      },
      orderBy: {
        order: "asc",
      },
      include: {
        subModuleProgress: {
          include: {
            moduleProgress: true,
          },
        },
      },
    });

    if (!currentLesson) {
      throw new Error("Lesson not found.");
    }

    // await prisma.lessonProgress.update({
    //   where: {
    //     id: currentLesson.id,
    //     users: { some: { id: userId } },
    //   },
    //   data: {
    //     status: Status.IN_PROGRESS,
    //   },
    // });

    const [previousLesson, nextLesson] = await getPreviousAndNextLessons(
      userId,
      subModuleId,
      currentLesson
    );

    /**
     * Update the status of the current lesson and the next lesson
     */
    await updateLessonStatuses(currentLesson, nextLesson, userId, subModuleId);
    /**
     * Fetch lesson content from Github
     * The repo name is the slug of the associated module progress
     * Path: subModuleSlug/lessons/lessonSlug.mdx
     */
    const repo = `${currentLesson!.subModuleProgress.moduleProgress.slug}`;
    const path = `${currentLesson!.subModuleProgress.slug}/lessons/${
      currentLesson!.slug
    }.mdx`;

    const { content: mdxContent } = await getContentFromGithub({
      repo,
      path,
    });

    if (!mdxContent) {
      throw new Error("Empty lesson content.");
    }

    const { data, content } = matter(mdxContent);
    return {
      mdx: { data, content },
      previousLesson,
      currentLesson,
      nextLesson,
    };
  } catch (error) {
    console.error(error);
    throw error;
    // if (error instanceof NotFoundError) {
    //   throw error;
    // }
    // throw new InternalServerError(
    //   "An error occured while fetching lesson content from CMS, please try again."
    // );
  }
}

/**
 * Update lesson statuses
 * @param {ILessonProgress} currentLesson - Current lesson
 * @param {ILessonProgress | null} nextLesson - Next lesson
 * @param {String} userId - User ID
 * @param {String} subModuleId - Submodule ID
 * @returns {Promise<void>}
 */
async function updateLessonStatuses(
  currentLesson: LessonProgress,
  nextLesson: LessonProgress | null,
  userId: string,
  subModuleId: string
) {
  try {
    await prisma.$transaction(async (txn) => {
      /**
       * If the user is viewing the lesson, mark it as completed
       * and update the next lesson to IN_PROGRESS
       */
      if (currentLesson.status === Status.IN_PROGRESS) {
        await txn.lessonProgress.update({
          where: {
            id: currentLesson.id,
            users: { some: { id: userId } },
          },
          data: {
            status: Status.COMPLETED,
          },
        });

        /**
         * Update the status of the next lesson to in progress if it is locked
         */
        if (nextLesson) {
          if (nextLesson.status === Status.LOCKED) {
            await txn.lessonProgress.update({
              where: {
                id: nextLesson.id,
                users: { some: { id: userId } },
              },
              data: {
                status: Status.IN_PROGRESS,
              },
            });
          }
        } else {
          /**
           * If there is no next lesson, update
           * the status of the sub module test to available
           */
          const subModuleTest = await txn.test.findFirst({
            where: {
              subModuleProgressId: subModuleId,
              users: { some: { id: userId } },
            },
          });

          if (
            subModuleTest &&
            subModuleTest.status === TestStatus.LOCKED &&
            !subModuleTest.attempted
          ) {
            await txn.test.update({
              where: {
                id: subModuleTest.id,
              },
              data: {
                status: TestStatus.AVAILABLE,
              },
            });
          }
        }
      }
    });
  } catch (error) {
    console.error(error);
    throw error;
    // throw new InternalServerError(
    //   "An error occured while updating lesson statuses, please try again."
    // );
  }
}

/**
 * Get previous and next lessons of a current lesson
 * @param {String} subModuleId - Submodule ID
 * @param {ILessonProgress} currentLesson - Current lesson
 * @param {Request} request - Request
 * @returns {Promise<Array<ILessonProgress|null>>}
 */
async function getPreviousAndNextLessons(
  userId: string,
  subModuleId: string,
  currentLesson: LessonProgress
): Promise<Array<LessonProgress | null>> {
  try {
    return Promise.all([
      prisma.lessonProgress.findFirst({
        where: {
          subModuleProgressId: subModuleId,
          users: { some: { id: userId } },
          order: { lt: currentLesson.order },
        },
        // orderBy: {
        //   order: "asc",
        // },
      }),
      prisma.lessonProgress.findFirst({
        where: {
          subModuleProgressId: subModuleId,
          users: { some: { id: userId } },
          order: { gt: currentLesson.order },
        },
        // orderBy: {
        //   order: "asc",
        // },
      }),
    ]);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Get lesson slug
 * @param {Request} request
 * @returns {String | undefined}
 */
function getLessonSlug(request: Request): string | undefined {
  return getSearchParam(request, "lessonSlug");
}

/**
 * Get search param from request
 * @param {Request} request
 * @param {String} key
 * @returns {String | undefined}
 */
function getSearchParam(request: Request, key: string): string | undefined {
  const url = new URL(request.url);
  const search = new URLSearchParams(url.search);
  return search.get(key) ?? undefined;
}

export async function getTypeformUrl(
  request: Request
): Promise<string | undefined> {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  if (!type) return undefined;
  return type;
}
