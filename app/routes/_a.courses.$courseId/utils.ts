import invariant from "tiny-invariant";
import { Params } from "@remix-run/react";
import { prisma } from "~/libs/prisma.server";
import { getUser } from "../sessions.server";
import { InternalServerError, NotFoundError } from "~/errors";
import { IModuleProgress } from "~/constants/types";

export async function getAssessmentAndMetadata(
  request: Request,
  params: Params<string>
) {
  try {
    invariant(params.courseId, "Course ID is required to get badges.");
    const courseId = params.courseId;
    const { id: userId } = await getUser(request);
    const moduleId = getModuleId(request);
    let module;
    if (!moduleId) {
      module = await getModule(userId, courseId);
    }
    const moduleIdToUse = moduleId ?? module!.id;
    const moduleProgress = await prisma.moduleProgress.findFirst({
      where: {
        id: moduleIdToUse,
        users: { some: { id: userId } },
      },
      include: {
        test: true,
        checkpoint: true,
      },
    });
    if (!moduleProgress) {
      throw new NotFoundError("Module not found.");
    }
    return moduleProgress;
  } catch (error) {
    throw new InternalServerError(
      "An error occured while fetching module, please try again."
    );
  }
}

export async function getProject(request: Request, params: Params<string>) {
  try {
    invariant(params.courseId, "Course ID is required to get badges.");
    const courseId = params.courseId;
    const { id: userId } = await getUser(request);
    return prisma.project.findFirst({
      where: {
        courseProgressId: courseId,
        contributors: { some: { id: userId } },
      },
    });
  } catch (error) {
    throw new InternalServerError(
      "An error occured while fetching project, please try again."
    );
  }
}

/**
 * Get modules by a given course ID
 * @param {Request} request
 * @param {Params<string>} params
 * @returns {Promise<modules>}
 */
export async function getModules(request: Request, params: Params<string>) {
  try {
    invariant(params.courseId, "Course ID is required to get modules.");
    const courseProgressId = params.courseId;
    const { id: userId } = await getUser(request);

    const modules = await prisma.moduleProgress.findMany({
      where: {
        users: { some: { id: userId } },
        courseProgressId: courseProgressId,
      },
      include: {
        courseProgress: {
          include: {
            project: true,
          },
        },
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
    const subModules = await prisma.subModuleProgress.findMany({
      where: { users: { some: { id: userId } }, moduleProgressId: module.id },
    });

    if (subModules.length > 0) {
      const firstSubModuleId = subModules[0].id;
      return prisma.subModuleProgress.update({
        where: { id: firstSubModuleId },
        data: { status: "IN_PROGRESS" },
      });
    }
  });
  await Promise.all(updatePromises);
}

/**
 * Get badges by a given module ID
 * @param {Request} request
 * @param {Params<string>} params
 * @returns {Promise<badges>}
 */
export async function getModuleBadges(
  request: Request,
  params: Params<string>
) {
  try {
    invariant(params.courseId, "Course ID is required to get badges.");
    const courseId = params.courseId;
    const { id: userId } = await getUser(request);
    const moduleId = getModuleId(request);
    let module;
    if (!moduleId) {
      module = await getModule(userId, courseId);
    }
    const moduleIdToUse = moduleId ?? module!.id;
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
 * @returns {Promise<subModules>}
 */
export async function getSubModules(request: Request, params: Params<string>) {
  try {
    invariant(params.courseId, "Course ID is required to get sub modules.");
    const { id: userId } = await getUser(request);
    const courseId = params.courseId;

    const moduleId = getModuleId(request);
    let module;
    if (!moduleId) {
      module = await getModule(userId, courseId);
    }
    const moduleIdToUse = moduleId ?? module!.id;

    const subModules = await prisma.subModuleProgress.findMany({
      where: {
        users: { some: { id: userId } },
        moduleProgressId: moduleIdToUse,
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
 * @returns {Promise}
 */
async function getModule(userId: string, courseId: string) {
  try {
    const module = await prisma.moduleProgress.findFirst({
      where: { users: { some: { id: userId } }, courseProgressId: courseId },
    });
    return module;
  } catch (error) {
    throw new InternalServerError(
      "An error occured while fetching module, please try again."
    );
  }
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
