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

    const modules = await prisma.moduleProgress.findMany({
      where: {
        users: { some: { id: userId } },
        courseProgressId: courseProgressId,
      },
      orderBy: {
        order: "asc",
      },
    });

    /**
     * If the user have started the course, set the first sub module to IN_PROGRESS
     * This is to ensure that the first subModule of a module is always in progress
     * when the user starts the course
     */
    await ensureFirstSubModuleInProgress(modules, userId);

    return modules;
  } catch (error) {
    throw new InternalServerError(
      "An error occured while fetching modules, please try again."
    );
  }
}

/**
 * Update first submodule on user start course
 * @param {IModuleProgress[]} modules
 * @param {String} userId
 */
async function ensureFirstSubModuleInProgress(
  modules: IModuleProgress[],
  userId: string
) {
  const updatePromises = modules.map(async (module) => {
    try {
      const subModules = await prisma.subModuleProgress.findMany({
        where: { users: { some: { id: userId } }, moduleProgressId: module.id },
        orderBy: {
          order: "asc",
        },
      });

      if (subModules.length > 0) {
        const firstSubModuleId = subModules[0].id;
        return prisma.subModuleProgress.update({
          where: { id: firstSubModuleId },
          data: { status: Status.IN_PROGRESS },
        });
      }
    } catch (error) {
      throw new InternalServerError(
        "An error occured while updating submodules, please try again."
      );
    }
  });
  await Promise.all(updatePromises);
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
