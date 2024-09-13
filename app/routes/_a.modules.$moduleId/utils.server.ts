import invariant from "tiny-invariant";
import { Params } from "@remix-run/react";
import { prisma, type SubModule, type Badge, Module } from "~/utils/db.server";
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
    await updateModuleStatus(request, moduleId);
    return await prisma.module.findUniqueOrThrow({
      where: {
        id: moduleId,
        users: { some: { id: userId } },
      },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Update module status to in progress
 * @param {Request} request
 * @param {string} moduleId
 */
async function updateModuleStatus(
  request: Request,
  moduleId: string
): Promise<Module | void> {
  const userId = await getUserId(request);
  const module = await prisma.module.findUniqueOrThrow({
    where: {
      id: moduleId,
      users: { some: { id: userId } },
    },
  });

  if (module.status !== STATUS.LOCKED) {
    return;
  }
  return prisma.module.update({
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
    await updateFirstSubModuleStatus(request, moduleId);
    return prisma.subModule.findMany({
      where: {
        moduleId: moduleId,
        users: { some: { id: userId } },
      },
      orderBy: {
        order: "asc",
      },
    });
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
  const firstSubModule = await prisma.subModule.findFirstOrThrow({
    where: {
      moduleId: moduleId,
      users: { some: { id: userId } },
    },
  });

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
