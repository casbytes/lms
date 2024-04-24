import { ICourse, ICourseProgress } from "~/constants/types";
import { prisma } from "~/libs/prisma";
import { getUser } from "~/utils/session.server";

/**
 * Get user courses
 * @param {Request} request
 * @returns {Promise<ICourseProgress[]>}
 */
export async function getUserCourses(request: Request): Promise<any> {
  const { userId } = await getUser(request);
  const userCourses = await prisma.courseProgress.findMany({
    where: { userId },
  });
  return userCourses;
}

/**
 * Check if a user already has a course in their catalog
 * @param {String} userId
 * @returns {Promise<Boolean>}
 */
export async function checkCatalog(userId: string): Promise<boolean> {
  const course = await prisma.courseProgress.findFirst({
    where: {
      userId,
    },
  });
  return course ? true : false;
}

/**
 * Get all courses
 * @param {Request} request
 * @returns {Promise<{ courses: ICourse[], inCatalog: boolean }> }
 */
export async function getCourses(
  request: Request
): Promise<{ courses: ICourse[]; inCatalog: boolean }> {
  const { userId } = await getUser(request);
  const inCatalog = await checkCatalog(userId);
  const courses = await prisma.course.findMany({ where: { published: true } });
  return { courses, inCatalog };
}

/**
 * Add a course to a user's catalog
 * @param {String} userId
 * @param {String} courseId
 * @returns
 */
export async function addCourseToCatalog(userId: string, courseId: string) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            subModules: {
              include: {
                lessons: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new Error(`No course found with given ID: ${courseId}`);
    }

    await prisma.$transaction(async (prisma) => {
      const courseProgress = await prisma.courseProgress.create({
        data: {
          title: course.title,
          slug: course.slug,
          user: { connect: { id: userId } },
        },
      });

      for (const module of course.modules) {
        const moduleProgress = await prisma.moduleProgress.create({
          data: {
            title: module.title,
            slug: module.slug,
            user: { connect: { id: userId } },
            course: { connect: { id: courseProgress.id } },
          },
        });

        /**
         * Update the first module to be in progress
         * This is to ensure that the user starts from the first module
         * when they start the course
         */
        if (module === course.modules[0]) {
          await prisma.moduleProgress.update({
            where: {
              id: moduleProgress.id,
            },
            data: {
              status: "IN_PROGRESS",
            },
          });
        }

        for (const subModule of module.subModules) {
          const subModuleProgress = await prisma.subModuleProgress.create({
            data: {
              title: subModule.title,
              slug: subModule.slug,
              user: { connect: { id: userId } },
              module: { connect: { id: moduleProgress.id } },
            },
          });

          for (const lesson of subModule.lessons) {
            await prisma.lessonProgress.create({
              data: {
                title: lesson.title,
                slug: lesson.slug,
                user: { connect: { id: userId } },
                subModule: { connect: { id: subModuleProgress.id } },
              },
            });
          }
        }
      }
    });
  } catch (error) {
    throw new Error("Failed to add course to your catalog, please try again.");
  }
}
