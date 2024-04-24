import invariant from "tiny-invariant";
import { Params } from "@remix-run/react";
import { prisma } from "~/libs/prisma";
import { getUser } from "~/utils/session.server";

/**
 * Get modules by a given course ID
 * @param {Request} request
 * @param {Params<string>} params
 * @returns {Promise<modules>}
 */
export async function getModules(request: Request, params: Params<string>) {
  invariant(params.courseId, "Course ID is required to get modules.");
  try {
    const courseId = params.courseId;
    const { userId } = await getUser(request);
    const modules = await prisma.moduleProgress.findMany({
      where: { userId, courseProgressId: courseId },
    });

    /**
     * If the user has started the course, set the first sub module to IN_PROGRESS
     * This is to ensure that the first subModule of a module is always in progress
     * when the user starts the course
     */
    for (const module of modules) {
      const subModules = await prisma.subModuleProgress.findMany({
        where: { userId, moduleProgressId: module.id },
      });

      if (subModules.length > 0) {
        const firstSubModuleId = subModules[0].id;
        await prisma.subModuleProgress.update({
          where: { id: firstSubModuleId },
          data: { status: "IN_PROGRESS" },
        });
      }
    }

    return modules;
  } catch (error) {
    throw new Error("Error fetching modules.");
  }
}

/**
 * Get sub modules by a given module ID
 * @param {Request} request
 * @param {Params<string>} params
 * @returns {Promise<subModules>}
 */
export async function getSubModules(request: Request, params: Params<string>) {
  invariant(params.courseId, "Course ID is required to get sub modules.");

  try {
    const { userId } = await getUser(request);

    const courseId = params.courseId;
    if (courseId) {
      const url = new URL(request.url);
      const moduleSearch = new URLSearchParams(url.search);
      let moduleId = moduleSearch.get("moduleId") ?? undefined;

      let module;
      if (!moduleId) {
        module = await prisma.moduleProgress.findFirst({
          where: { userId, courseProgressId: courseId },
        });
      }

      const subModules = await prisma.subModuleProgress.findMany({
        where: { userId, moduleProgressId: moduleId ?? module!.id },
        include: {
          module: true,
        },
      });

      return subModules;
    }
  } catch (error) {
    throw new Error("Error fetching sub modules.");
  }
}
