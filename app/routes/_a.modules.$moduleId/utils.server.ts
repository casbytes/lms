import invariant from "tiny-invariant";
import { Params } from "@remix-run/react";
import { prisma, type SubModule, type Badge } from "~/utils/db.server";
import { getUserId } from "~/utils/session.server";
import { STATUS } from "~/utils/helpers";

/**
 *
 * @param {Request} request
 * @param {Params} params
 * @returns {Promise<types.Module>}
 */
export async function getModule(request: Request, params: Params<string>) {
  try {
    invariant(params.moduleId, "Module ID is required to get module.");
    const moduleId = params.moduleId;
    const userId = await getUserId(request);

    const [module] = await Promise.all([
      prisma.module.findFirst({
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
    if (!module) {
      throw new Error("Module not found.");
    }
    return module;
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
  const module = await prisma.module.findFirst({
    where: {
      id: moduleId,
      users: { some: { id: userId } },
    },
  });

  if (!module) {
    return;
  }

  if (
    module.status === STATUS.IN_PROGRESS ||
    module.status === STATUS.COMPLETED
  ) {
    return;
  }
  await prisma.module.update({
    where: {
      id: moduleId,
      users: { some: { id: userId } },
    },
    data: {
      status: STATUS.IN_PROGRESS,
    },
  });
}

/**
 * Get sub modules by a given module ID
 * @param {Request} request
 * @param {Params<string>} params
 * @returns {Promise<types.SubModule[]>}
 */
export async function getSubModules(
  request: Request,
  params: Params<string>
): Promise<SubModule[]> {
  try {
    invariant(params.moduleId, "Module ID is required to get module.");
    const moduleId = params.moduleId;
    const userId = await getUserId(request);

    const subModules = await prisma.subModule.findMany({
      where: {
        moduleId: moduleId,
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
  const firstSubModule = await prisma.subModule.findFirst({
    where: {
      moduleId: moduleId,
      users: { some: { id: userId } },
    },
  });

  if (!firstSubModule) {
    return;
  }

  if (
    firstSubModule.status === STATUS.IN_PROGRESS ||
    firstSubModule.status === STATUS.COMPLETED
  ) {
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
      where: { userId, moduleId: moduleId },
      include: {
        module: true,
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
        moduleId: moduleId,
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

export async function getCheckpoint(request: Request, params: Params<string>) {
  try {
    invariant(params.moduleId, "Module ID is required to get checkpoint.");
    const moduleId = params.moduleId;
    const userId = await getUserId(request);

    const checkpoint = await prisma.checkpoint.findFirst({
      where: {
        moduleId: moduleId,
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
