import invariant from "tiny-invariant";
import { Params } from "@remix-run/react";
import { prisma, type SubModuleProgress, type Badge } from "~/utils/db.server";
import { getUserId } from "~/utils/session.server";
import { Status } from "~/constants/enums";

/**
 *
 * @param {Request} request
 * @param {Params} params
 * @returns {Promise<types.ModuleProgress>}
 */
export async function getModule(request: Request, params: Params<string>) {
  try {
    invariant(params.moduleId, "Module ID is required to get module.");
    const moduleId = params.moduleId;
    const userId = await getUserId(request);

    const [moduleProgress] = await Promise.all([
      prisma.moduleProgress.findFirst({
        where: {
          id: moduleId,
          users: { some: { id: userId } },
        },
        orderBy: {
          order: "asc",
        },
      }),
      updateModuleStatues(request, moduleId),
    ]);
    if (!moduleProgress) {
      throw new Error("Module not found.");
    }
    return moduleProgress;
  } catch (error) {
    throw error;
  }
}

/**
 * Update module status to in progress
 * @param {Request} request
 * @param {string} moduleId
 */
async function updateModuleStatues(
  request: Request,
  moduleId: string
): Promise<void> {
  const userId = await getUserId(request);
  const moduleProgress = await prisma.moduleProgress.findFirst({
    where: {
      id: moduleId,
      users: { some: { id: userId } },
    },
  });

  if (!moduleProgress) {
    return;
  }

  if (
    moduleProgress.status === Status.IN_PROGRESS ||
    moduleProgress.status === Status.COMPLETED
  ) {
    return;
  }
  await prisma.moduleProgress.update({
    where: {
      id: moduleId,
      users: { some: { id: userId } },
    },
    data: {
      status: Status.IN_PROGRESS,
    },
  });
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
): Promise<SubModuleProgress[]> {
  try {
    invariant(params.moduleId, "Module ID is required to get module.");
    const moduleId = params.moduleId;
    const userId = await getUserId(request);

    const subModules = await prisma.subModuleProgress.findMany({
      where: {
        moduleProgressId: moduleId,
        users: { some: { id: userId } },
      },
      orderBy: {
        order: "asc",
      },
    });

    await updateFirstSubModuleStatus(request, moduleId);
    return subModules;
  } catch (error) {
    throw error;
  }
}

/**
 * Update the first sub module status to in progress
 * @param {Request} request
 * @param {string} moduleId
 */
async function updateFirstSubModuleStatus(
  request: Request,
  moduleId: string
): Promise<void> {
  const userId = await getUserId(request);
  const firstSubModule = await prisma.subModuleProgress.findFirst({
    where: {
      moduleProgressId: moduleId,
      users: { some: { id: userId } },
    },
  });

  if (!firstSubModule) {
    return;
  }

  if (
    firstSubModule.status === Status.IN_PROGRESS ||
    firstSubModule.status === Status.COMPLETED
  ) {
    return;
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
): Promise<Badge[]> {
  try {
    invariant(params.moduleId, "Module ID is required to get module.");
    const moduleId = params.moduleId;
    const userId = await getUserId(request);

    const badges = await prisma.badge.findMany({
      where: { userId, moduleProgressId: moduleId },
      include: {
        moduleProgress: true,
      },
    });
    return badges;
  } catch (error) {
    throw error;
  }
}

export async function getTest(request: Request, params: Params<string>) {
  try {
    invariant(params.moduleId, "Module ID is required to get test.");
    const moduleId = params.moduleId;
    const userId = await getUserId(request);

    const test = await prisma.test.findFirst({
      where: {
        moduleProgressId: moduleId,
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
    invariant(params.moduleId, "Module ID is required to get checkpoint.");
    const moduleId = params.moduleId;
    const userId = await getUserId(request);

    const checkpoint = await prisma.checkpoint.findFirst({
      where: {
        moduleProgressId: moduleId,
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
