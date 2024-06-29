import invariant from "tiny-invariant";
import { Params } from "@remix-run/react";
import { prisma, types } from "~/utils/db.server";
import { InternalServerError, NotFoundError } from "~/errors";
import { getUserId } from "~/utils/session.server";
import { Status } from "~/constants/enums";

/**
 *
 * @param {Request} request
 * @param {Params} params
 * @returns {Promise<types.ModuleProgress>}
 */
export async function getModule(
  request: Request,
  params: Params<string>
): Promise<types.ModuleProgress> {
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
        include: {
          test: true,
          checkpoint: true,
          courseProgress: {
            include: {
              project: true,
            },
          },
        },
      }),
      updateModuleStatues(request, moduleId),
    ]);
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
): Promise<types.SubModuleProgress[]> {
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
    throw new InternalServerError(
      "An error occured while fetching badges, please try again."
    );
  }
}
