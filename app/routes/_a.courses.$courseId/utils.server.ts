import invariant from "tiny-invariant";
import { Params } from "@remix-run/react";
import { InternalServerError, NotFoundError } from "~/errors";
import { prisma, types } from "~/utils/db.server";
import { getUserId } from "~/utils/session.server";
import { Status } from "~/constants/enums";

/**
 * Get default Module
 * @param {String} userId
 * @param {String} courseId
 * @returns {Promise<types.ModuleProgress>}
 */
async function getDefaultModule(
  userId: string,
  courseId: string
): Promise<types.ModuleProgress> {
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
 * Get module ID
 * @param {Request} request
 * @returns {String | undefined}
 */
function getModuleIdFromRequest(request: Request): string | undefined {
  const url = new URL(request.url);
  const moduleSearch = new URLSearchParams(url.search);
  let moduleId = moduleSearch.get("moduleId") ?? undefined;
  return moduleId;
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
  const moduleId = getModuleIdFromRequest(request);
  let module;
  if (!moduleId) {
    module = await getDefaultModule(userId, courseId);
  }
  const moduleIdToUse = moduleId ?? module!.id;
  return moduleIdToUse;
}

export async function getModule(
  request: Request,
  params: Params<string>
): Promise<types.ModuleProgress> {
  invariant(params.courseId, "Course ID is required to get test.");
  const courseId = params.courseId;
  const userId = await getUserId(request);
  const moduleIdToUse = await getModuleIdToUse(request, userId, courseId);
  const moduleProgress = await prisma.moduleProgress.findUnique({
    where: {
      id: moduleIdToUse,
    },
  });
  if (!moduleProgress) {
    throw new NotFoundError("ModuleProgress not found");
  }
  return moduleProgress;
}

export async function getTest(request: Request, params: Params<string>) {
  try {
    invariant(params.courseId, "Course ID is required to get test.");
    const courseId = params.courseId;
    const userId = await getUserId(request);
    const moduleIdToUse = await getModuleIdToUse(request, userId, courseId);

    const test = await prisma.test.findFirst({
      where: {
        moduleProgressId: moduleIdToUse,
        users: { some: { id: userId } },
      },
    });

    if (!test) {
      throw new NotFoundError("Test not found");
    }
    return test;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError(
      "An error occured while fetching test, please try again."
    );
  }
}

export async function getCheckpoint(request: Request, params: Params<string>) {
  try {
    invariant(params.courseId, "Course ID is required to get checkpoint.");
    const courseId = params.courseId;
    const userId = await getUserId(request);
    const moduleIdToUse = await getModuleIdToUse(request, userId, courseId);

    const checkpoint = await prisma.checkpoint.findFirst({
      where: {
        moduleProgressId: moduleIdToUse,
        users: { some: { id: userId } },
      },
    });

    if (!checkpoint) {
      throw new NotFoundError("Test not found");
    }
    return checkpoint;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError(
      "An error occured while fetching checkpoint, please try again."
    );
  }
}

export async function getProject(request: Request, params: Params<string>) {
  invariant(params.courseId, "Course ID is required to get checkpoint.");
  try {
    const courseId = params.courseId;
    const userId = await getUserId(request);
    const project = await prisma.project.findFirst({
      where: {
        courseProgressId: courseId,
        contributors: { some: { id: userId } },
      },
    });

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    return project;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError(
      "An error occured while fetching project, please try again."
    );
  }
}

/**
 * Get modules by a given course ID
 * @param {Request} request
 * @param {Params<string>} params
 * @returns {Promise<types.ModuleProgress[]>}
 */
export async function getModules(
  request: Request,
  params: Params<string>
): Promise<types.ModuleProgress[]> {
  try {
    invariant(params.courseId, "Course ID is required to get modules.");
    const courseProgressId = params.courseId;
    const userId = await getUserId(request);

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
async function updateFirstModule(
  userId: string,
  courseProgressId: string
): Promise<void> {
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
async function updateFirstSubModule(
  userId: string,
  moduleProgressId: string
): Promise<void> {
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
 * @returns {Promise<types.Badge[]>}
 */
export async function getModuleBadges(
  request: Request,
  params: Params<string>
): Promise<types.Badge[]> {
  try {
    invariant(params.courseId, "Course ID is required to get badges.");
    const courseId = params.courseId;
    const userId = await getUserId(request);
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
 * @returns {Promise<types.SubModuleProgress[]>}
 */
export async function getSubModules(
  request: Request,
  params: Params<string>
): Promise<types.SubModuleProgress[]> {
  try {
    invariant(params.courseId, "Course ID is required to get sub modules.");
    const courseId = params.courseId;
    const userId = await getUserId(request);
    const moduleIdToUse = await getModuleIdToUse(request, userId, courseId);

    const subModules = await prisma.subModuleProgress.findMany({
      where: {
        moduleProgressId: moduleIdToUse,
        users: { some: { id: userId } },
      },
      orderBy: {
        order: "asc",
      },
    });

    return subModules;
  } catch (error) {
    throw new InternalServerError(
      "An error occured while fetching sub modules, please try again."
    );
  }
}
