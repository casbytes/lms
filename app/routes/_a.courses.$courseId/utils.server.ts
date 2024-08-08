import invariant from "tiny-invariant";
import { type Params } from "@remix-run/react";
import {
  type Module,
  type SubModule,
  type Badge,
  prisma,
} from "~/utils/db.server";
import { getUserId } from "~/utils/session.server";
import { BADGE_STATUS, STATUS } from "~/utils/helpers";

/**
 * Get default Module
 * @param {String} userId
 * @param {String} courseId
 * @returns {Promise<Module | null>}
 */
async function getDefaultModule(
  userId: string,
  courseId: string
): Promise<Module> {
  try {
    const module = await prisma.module.findFirst({
      where: { users: { some: { id: userId } }, courseId: courseId },
      orderBy: { order: "asc" },
    });

    if (!module) {
      throw new Error("First module not found");
    }
    return module;
  } catch (error) {
    throw error;
  }
}

/**
 * Get module ID
 * @param {Request} request
 * @returns {String | undefined}
 */
function getModuleIdFromRequest(request: Request): string | null {
  const url = new URL(request.url);
  const moduleSearch = new URLSearchParams(url.search);
  const moduleId = moduleSearch.get("moduleId");
  return moduleId ?? null;
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
  params: Params<string>
): Promise<string> {
  invariant(params.courseId, "Course ID is required to get module.");
  const courseId = params.courseId;
  const userId = await getUserId(request);

  let module: Module;
  const moduleId = getModuleIdFromRequest(request);
  if (!moduleId) {
    module = await getDefaultModule(userId, courseId);
  }
  return moduleId ?? module!.id;
}

export async function getModule(
  request: Request,
  params: Params<string>
): Promise<Module> {
  invariant(params.courseId, "Course ID is required to get module.");
  const moduleIdToUse = await getModuleIdToUse(request, params);
  const module = await prisma.module.findUnique({
    where: {
      id: moduleIdToUse,
    },
  });
  if (!module) {
    throw new Error("Module not found");
  }
  return module;
}

export async function getTest(request: Request, params: Params<string>) {
  try {
    const userId = await getUserId(request);
    const moduleIdToUse = await getModuleIdToUse(request, params);

    const test = await prisma.test.findFirst({
      where: {
        moduleId: moduleIdToUse,
        users: { some: { id: userId } },
      },
    });
    if (!test) return null;
    return test;
  } catch (error) {
    throw error;
  }
}

export async function getCheckpoint(request: Request, params: Params<string>) {
  try {
    const userId = await getUserId(request);
    const moduleIdToUse = await getModuleIdToUse(request, params);

    const checkpoint = await prisma.checkpoint.findFirst({
      where: {
        moduleId: moduleIdToUse,
        users: { some: { id: userId } },
      },
    });
    if (!checkpoint) return null;
    return checkpoint;
  } catch (error) {
    throw error;
  }
}

export async function getProject(request: Request, params: Params<string>) {
  invariant(params.courseId, "Course ID is required to get checkpoint.");
  try {
    const courseId = params.courseId;
    const userId = await getUserId(request);
    const project = await prisma.project.findFirst({
      where: {
        courseId: courseId,
        contributors: { some: { id: userId } },
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    return project;
  } catch (error) {
    throw error;
  }
}

/**
 * Get modules by a given course ID
 * @param {Request} request
 * @param {Params<string>} params
 * @returns {Promise<Module[]>}
 */
export async function getModules(
  request: Request,
  params: Params<string>
): Promise<Module[]> {
  invariant(params.courseId, "Course ID is required to get modules.");
  try {
    const courseId = params.courseId;
    const userId = await getUserId(request);

    // const firstModule = await getDefaultModule(userId, courseId);
    const moduleIdToUse = await getModuleIdToUse(request, params);
    const firstSubModule = await prisma.subModule.findFirst({
      where: {
        moduleId: moduleIdToUse,
        users: { some: { id: userId } },
      },
      orderBy: {
        order: "asc",
      },
    });

    if (!firstSubModule) {
      throw new Error("First Sub Module not found.");
    }

    const [modules] = await Promise.all([
      prisma.module.findMany({
        where: {
          users: { some: { id: userId } },
          courseId: courseId,
        },
        orderBy: {
          order: "asc",
        },
      }),
      /**
       * If the user have started the course, set the first module and sub module to IN_PROGRESS
       */
      updateFirstModule(userId, courseId),
      updateFirstSubModule(userId, moduleIdToUse),
      // updateFirstSubModule(userId, firstModule.id),
    ]);

    return modules;
  } catch (error) {
    throw error;
  }
}

/**
 *  Update the first module of a given course
 * @param userId - User ID
 * @param courseId - Course  ID
 */
async function updateFirstModule(
  userId: string,
  courseId: string
): Promise<void> {
  const firstModule = await prisma.module.findFirst({
    where: {
      users: { some: { id: userId } },
      courseId: courseId,
    },
    orderBy: {
      order: "asc",
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!firstModule) {
    throw new Error("First Module not found.");
  }

  if (firstModule.status !== STATUS.LOCKED) {
    return;
  }
  await prisma.module.update({
    where: { id: firstModule.id },
    data: { status: STATUS.IN_PROGRESS },
  });
}

/**
 *  Update the first sub module of a given module
 * @param {String} userId - User ID
 * @param {String} moduleId - Module  ID
 */
async function updateFirstSubModule(
  userId: string,
  moduleId: string
): Promise<void> {
  const firstSubModule = await prisma.subModule.findFirst({
    where: {
      moduleId: moduleId,
      users: { some: { id: userId } },
    },
    orderBy: {
      order: "asc",
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!firstSubModule) {
    throw new Error("First Sub Module not found.");
  }

  if (firstSubModule.status !== STATUS.LOCKED) {
    return;
  }
  await prisma.subModule.update({
    where: { id: firstSubModule.id },
    data: { status: STATUS.IN_PROGRESS },
  });
}

/**
 * Get badges by a given module ID
 * @param {Request} request
 * @param {Params<string>} params
 * @returns {Promise<Badge[]>}
 */
export async function getModuleBadges(
  request: Request,
  params: Params<string>
): Promise<Badge[]> {
  try {
    const userId = await getUserId(request);
    const moduleIdToUse = await getModuleIdToUse(request, params);

    const badges = await prisma.badge.findMany({
      where: { userId, moduleId: moduleIdToUse },
      include: {
        module: true,
      },
    });
    await enableBadge(userId, moduleIdToUse, badges);
    return badges;
  } catch (error) {
    throw error;
  }
}

/**
 * Enable badge based on the user's progress
 * @param {String} userId
 * @param {String} moduleId
 * @param {Badge[]} badges
 */
async function enableBadge(userId: string, moduleId: string, badges: Badge[]) {
  const totalSubtmodules = await prisma.subModule.count({
    where: {
      moduleId,
      users: { some: { id: userId } },
    },
  });
  const completedSubmodules = await prisma.subModule.count({
    where: {
      moduleId,
      users: { some: { id: userId } },
      status: STATUS.COMPLETED,
    },
  });

  const currentPercentage = (completedSubmodules / totalSubtmodules) * 100;

  enum BADGE_LEVELS {
    NOVICE = "NOVICE",
    ADEPT = "ADEPT",
    PROFICIENT = "PROFICIENT",
    VIRTUOSO = "VIRTUOSO",
  }

  for (const badge of badges) {
    if (
      currentPercentage >= 25 &&
      badge.status === BADGE_STATUS.LOCKED &&
      badge.level === BADGE_LEVELS.NOVICE
    ) {
      await prisma.badge.update({
        where: { id: badge.id },
        data: { status: BADGE_STATUS.UNLOCKED },
      });
    }
    if (
      currentPercentage >= 50 &&
      badge.status === BADGE_STATUS.LOCKED &&
      badge.level === BADGE_LEVELS.ADEPT
    ) {
      await prisma.badge.update({
        where: { id: badge.id },
        data: { status: BADGE_STATUS.UNLOCKED },
      });
    }
    if (
      currentPercentage >= 75 &&
      badge.status === BADGE_STATUS.LOCKED &&
      badge.level === BADGE_LEVELS.PROFICIENT
    ) {
      await prisma.badge.update({
        where: { id: badge.id },
        data: { status: BADGE_STATUS.UNLOCKED },
      });
    }
    if (
      currentPercentage >= 100 &&
      badge.status === BADGE_STATUS.LOCKED &&
      badge.level === BADGE_LEVELS.VIRTUOSO
    ) {
      await prisma.badge.update({
        where: { id: badge.id },
        data: { status: BADGE_STATUS.UNLOCKED },
      });
    }
  }
}

/**
 * Get sub modules by a given module ID
 * @param {Request} request
 * @param {Params<string>} params
 * @returns {Promise<SubModule[]>}
 */
export async function getSubModules(
  request: Request,
  params: Params<string>
): Promise<SubModule[]> {
  try {
    const userId = await getUserId(request);
    const moduleIdToUse = await getModuleIdToUse(request, params);

    const subModules = await prisma.subModule.findMany({
      where: {
        moduleId: moduleIdToUse,
        users: { some: { id: userId } },
      },
      orderBy: {
        order: "asc",
      },
    });

    return subModules;
  } catch (error) {
    throw error;
  }
}
