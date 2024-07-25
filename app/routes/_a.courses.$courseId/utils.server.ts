import invariant from "tiny-invariant";
import { type Params } from "@remix-run/react";
import {
  type ModuleProgress,
  type SubModuleProgress,
  prisma,
  Badge,
} from "~/utils/db.server";
import { getUserId } from "~/utils/session.server";
import { BadgeStatus, Status } from "~/constants/enums";

/**
 * Get default Module
 * @param {String} userId
 * @param {String} courseId
 * @returns {Promise<ModuleProgress>}
 */
async function getDefaultModule(
  userId: string,
  courseId: string
): Promise<ModuleProgress | void> {
  try {
    const module = await prisma.moduleProgress.findFirst({
      where: { users: { some: { id: userId } }, courseProgressId: courseId },
      orderBy: {
        order: "asc",
      },
    });
    if (!module) {
      return;
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
): Promise<ModuleProgress> {
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
    throw new Error("ModuleProgress not found");
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
      throw new Error("Test not found");
    }
    return test;
  } catch (error) {
    throw error;
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
      throw new Error("Test not found");
    }
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
        courseProgressId: courseId,
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
 * @returns {Promise<ModuleProgress[]>}
 */
export async function getModules(
  request: Request,
  params: Params<string>
): Promise<ModuleProgress[]> {
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
      throw new Error("First Module not found.");
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
      throw new Error("First Sub Module not found.");
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
    throw error;
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
    throw new Error("First Module not found.");
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
    throw new Error("First Sub Module not found.");
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
 * @returns {Promise<Badge[]>}
 */
export async function getModuleBadges(
  request: Request,
  params: Params<string>
): Promise<Badge[]> {
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
    await enableBadge(userId, moduleIdToUse, badges);
    return badges;
  } catch (error) {
    throw error;
  }
}

/**
 * Enable badge based on the user's progress
 * @param {String} userId
 * @param {String} moduleProgressId
 * @param {Badge[]} badges
 */
async function enableBadge(
  userId: string,
  moduleProgressId: string,
  badges: Badge[]
) {
  const totalSubtmodules = await prisma.subModuleProgress.count({
    where: {
      moduleProgressId,
      users: { some: { id: userId } },
    },
  });
  const completedSubmodules = await prisma.subModuleProgress.count({
    where: {
      moduleProgressId,
      users: { some: { id: userId } },
      status: Status.COMPLETED,
    },
  });

  const currentPercentage = (completedSubmodules / totalSubtmodules) * 100;

  enum BadgeLevels {
    NOVICE = "NOVICE",
    ADEPT = "ADEPT",
    PROFICIENT = "PROFICIENT",
    VIRTUOSO = "VIRTUOSO",
  }

  for (const badge of badges) {
    if (
      currentPercentage >= 25 &&
      badge.status === BadgeStatus.LOCKED &&
      badge.level === BadgeLevels.NOVICE
    ) {
      await prisma.badge.update({
        where: { id: badge.id },
        data: { status: BadgeStatus.UNLOCKED },
      });
    }
    if (
      currentPercentage >= 50 &&
      badge.status === BadgeStatus.LOCKED &&
      badge.level === BadgeLevels.ADEPT
    ) {
      await prisma.badge.update({
        where: { id: badge.id },
        data: { status: BadgeStatus.UNLOCKED },
      });
    }
    if (
      currentPercentage >= 75 &&
      badge.status === BadgeStatus.LOCKED &&
      badge.level === BadgeLevels.PROFICIENT
    ) {
      await prisma.badge.update({
        where: { id: badge.id },
        data: { status: BadgeStatus.UNLOCKED },
      });
    }
    if (
      currentPercentage >= 100 &&
      badge.status === BadgeStatus.LOCKED &&
      badge.level === BadgeLevels.VIRTUOSO
    ) {
      await prisma.badge.update({
        where: { id: badge.id },
        data: { status: BadgeStatus.UNLOCKED },
      });
    }
  }
}

/**
 * Get sub modules by a given module ID
 * @param {Request} request
 * @param {Params<string>} params
 * @returns {Promise<SubModuleProgress[]>}
 */
export async function getSubModules(
  request: Request,
  params: Params<string>
): Promise<SubModuleProgress[]> {
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
    throw error;
  }
}
