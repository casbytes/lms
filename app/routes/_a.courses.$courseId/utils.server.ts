import invariant from "tiny-invariant";
import { Params } from "@remix-run/react";
import { prisma } from "~/libs/prisma.server";
import { getUser } from "~/utils/sessions.server";
import { InternalServerError, NotFoundError } from "~/errors";
import {
  IBadge,
  IModuleProgress,
  ISubModuleProgress,
  Status,
} from "~/constants/types";

/**
 *
 * @param {Request} request
 * @param {Params} params
 * @returns {Promise<IModuleProgress>}
 */
export async function getTestCheckpointProject(
  request: Request,
  params: Params<string>
): Promise<IModuleProgress> {
  try {
    invariant(params.courseId, "Course ID is required to get badges.");
    const courseId = params.courseId;
    const { id: userId } = await getUser(request);
    const moduleIdToUse = await getModuleIdToUse(request, userId, courseId);

    const moduleProgress = await prisma.moduleProgress.findFirst({
      where: {
        id: moduleIdToUse,
        users: { some: { id: userId } },
      },
      orderBy: {
        order: "asc",
      },
      include: {
        test: true,
        checkpoint: true,
        courseProgress: {
          include: {
            project: true,
          },
        },
      },
    });
    if (!moduleProgress) {
      throw new NotFoundError("Module not found.");
    }
    return moduleProgress;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError(
      "An error occured while fetching module, please try again."
    );
  }
}

/**
 * Get modules by a given course ID
 * @param {Request} request
 * @param {Params<string>} params
 * @returns {Promise<IModuleProgress[]>}
 */
export async function getModules(
  request: Request,
  params: Params<string>
): Promise<IModuleProgress[]> {
  try {
    invariant(params.courseId, "Course ID is required to get modules.");
    const courseProgressId = params.courseId;
    const { id: userId } = await getUser(request);

    /**
     * Get the first module of the course
     * This is to ensure that the first module is always in progress
     */
    const firstModule = await prisma.moduleProgress.findFirst({
      where: {
        users: { some: { id: userId } },
        courseProgressId: courseProgressId,
      },
      orderBy: {
        order: "asc",
      },
    });

    if (!firstModule) {
      throw new NotFoundError("First Module not found.");
    }

    const firstSubModule = await prisma.subModuleProgress.findFirst({
      where: {
        moduleProgressId: firstModule.id,
        users: { some: { id: userId } },
      },
      orderBy: {
        order: "asc",
      },
    });

    if (!firstSubModule) {
      throw new NotFoundError("First Sub Module not found.");
    }

    await prisma.subModuleProgress.update({
      where: { id: firstSubModule.id },
      data: { status: Status.IN_PROGRESS },
    });

    const [modules] = await Promise.all([
      prisma.moduleProgress.findMany({
        where: {
          users: { some: { id: userId } },
          courseProgressId: courseProgressId,
        },
        orderBy: {
          order: "asc",
        },
      }),
      /**
       * If the user have started the course, set the first module and sub module to IN_PROGRESS
       */
      updateFirstModule(userId, courseProgressId),
      updateFirstSubModule(userId, firstModule.id),
    ]);

    return modules;
  } catch (error) {
    throw new InternalServerError(
      "An error occured while fetching modules, please try again."
    );
  }
}

/**
 *  Update the first module of a given course
 * @param userId - User ID
 * @param courseProgressId - Course Progress ID
 */
async function updateFirstModule(userId: string, courseProgressId: string) {
  const firstModule = await prisma.moduleProgress.findFirst({
    where: {
      users: { some: { id: userId } },
      courseProgressId: courseProgressId,
    },
    orderBy: {
      order: "asc",
    },
  });

  if (!firstModule) {
    throw new NotFoundError("First Module not found.");
  }

  await prisma.moduleProgress.update({
    where: { id: firstModule.id },
    data: { status: Status.IN_PROGRESS },
  });
}

/**
 *  Update the first sub module of a given module
 * @param {String} userId - User ID
 * @param {String} moduleProgressId - Module Progress ID
 */
async function updateFirstSubModule(userId: string, moduleProgressId: string) {
  const firstSubModule = await prisma.subModuleProgress.findFirst({
    where: {
      moduleProgressId: moduleProgressId,
      users: { some: { id: userId } },
    },
    orderBy: {
      order: "asc",
    },
  });

  if (!firstSubModule) {
    throw new NotFoundError("First Sub Module not found.");
  }

  await prisma.subModuleProgress.update({
    where: { id: firstSubModule.id },
    data: { status: Status.IN_PROGRESS },
  });
}

/**
 * Get badges by a given module ID
 * @param {Request} request
 * @param {Params<string>} params
 * @returns {Promise<IBadge[]>}
 */
export async function getModuleBadges(
  request: Request,
  params: Params<string>
): Promise<IBadge[]> {
  try {
    invariant(params.courseId, "Course ID is required to get badges.");

    const courseId = params.courseId;
    const { id: userId } = await getUser(request);
    const moduleIdToUse = await getModuleIdToUse(request, userId, courseId);

    const badges = await prisma.badge.findMany({
      where: { userId, moduleProgressId: moduleIdToUse },
      include: {
        moduleProgress: true,
      },
    });
    return badges;
  } catch (error) {
    throw new InternalServerError(
      "An error occured while fetching badges, please try again."
    );
  }
}

/**
 * Get sub modules by a given module ID
 * @param {Request} request
 * @param {Params<string>} params
 * @returns {Promise<ISubModuleProgress[]>}
 */
export async function getSubModules(
  request: Request,
  params: Params<string>
): Promise<ISubModuleProgress[]> {
  try {
    invariant(params.courseId, "Course ID is required to get sub modules.");
    const courseId = params.courseId;
    const { id: userId } = await getUser(request);
    const moduleIdToUse = await getModuleIdToUse(request, userId, courseId);

    const subModules = await prisma.subModuleProgress.findMany({
      where: {
        users: { some: { id: userId } },
        moduleProgressId: moduleIdToUse,
      },
      orderBy: {
        order: "asc",
      },
      include: {
        moduleProgress: {
          include: {
            test: true,
            checkpoint: true,
          },
        },
      },
    });

    return subModules;
  } catch (error) {
    throw new InternalServerError(
      "An error occured while fetching sub modules, please try again."
    );
  }
}

/**
 * Get Module
 * @param {String} userId
 * @param {String} courseId
 * @returns {Promise<IModuleProgress>}
 */
async function getModule(
  userId: string,
  courseId: string
): Promise<IModuleProgress> {
  try {
    const module = await prisma.moduleProgress.findFirst({
      where: { users: { some: { id: userId } }, courseProgressId: courseId },
      orderBy: {
        order: "asc",
      },
    });
    if (!module) {
      throw new NotFoundError("Module not found.");
    }
    return module;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError(
      "An error occured while fetching module, please try again."
    );
  }
}

/**
 * Get module ID to use in fetching sub modules
 * @param {Request} request
 * @param {String} userId
 * @param {String} courseId
 * @returns {Promise<string>}
 */
async function getModuleIdToUse(
  request: Request,
  userId: string,
  courseId: string
): Promise<string> {
  const moduleId = getModuleId(request);
  let module;
  if (!moduleId) {
    module = await getModule(userId, courseId);
  }
  const moduleIdToUse = moduleId ?? module!.id;
  return moduleIdToUse;
}

/**
 * Get module ID
 * @param {Request} request
 * @returns {String | undefined}
 */
function getModuleId(request: Request): string | undefined {
  const url = new URL(request.url);
  const moduleSearch = new URLSearchParams(url.search);
  let moduleId = moduleSearch.get("moduleId") ?? undefined;
  return moduleId;
}
