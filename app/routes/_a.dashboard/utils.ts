import { ICourse, ICourseProgress } from "~/constants/types";
import { getUser } from "../sessions";
import { prisma } from "~/libs/prisma.server";

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
  const courses = await prisma.courseProgress.findMany({
    where: {
      userId,
      NOT: {
        status: "COMPLETED",
      },
    },
  });

  return courses.length > 0;
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

    /**
     * Create course progress, module progress, sub module progress, lesson  * *  progress, test and checkpoint using a transaction to ensure atomicity
     */
    await prisma.$transaction(async (txn) => {
      /**
       * Create course progress, module progress, sub module progress, lesson * * progress, test checkpoint, and project
       */
      const courseProgress = await txn.courseProgress.create({
        data: {
          title: course.title,
          slug: course.slug,
          user: { connect: { id: userId } },
        },
        include: {
          moduleProgress: true,
        },
      });

      /**
       * Create module progress, sub module progress, lesson progress, test * * * checkpoint
       */
      await Promise.all(
        course.modules.map(async (module) => {
          const moduleProgress = await txn.moduleProgress.create({
            data: {
              title: module.title,
              slug: module.slug,
              user: { connect: { id: userId } },
              course: { connect: { id: courseProgress.id } },
            },
          });

          /**
           * Update the first module to be in progress
           * This is to ensure the user starts from the first module
           */
          // if (moduleProgress.id === courseProgress.moduleProgress[0].id) {
          //   await prisma.moduleProgress.update({
          //     where: {
          //       id: moduleProgress.id,
          //     },
          //     data: {
          //       status: "IN_PROGRESS",
          //     },
          //   });
          // }

          /**
           * Create sub module progress, lesson progress, test, and checkpoint
           */
          await Promise.all(
            module?.subModules?.map(async (subModule) => {
              const subModuleProgress = await txn.subModuleProgress.create({
                data: {
                  title: subModule.title,
                  slug: subModule.slug,
                  user: { connect: { id: userId } },
                  module: { connect: { id: moduleProgress.id } },
                },
              });

              /**
               * Create lesson progress
               */
              await Promise.all(
                subModule?.lessons?.map(async (lesson) => {
                  await txn.lessonProgress.create({
                    data: {
                      title: lesson.title,
                      slug: lesson.slug,
                      user: { connect: { id: userId } },
                      subModule: { connect: { id: subModuleProgress.id } },
                    },
                  });
                })
              );

              /**
               * Create test and checkpoint for sub module
               */
              if (subModuleProgress) {
                await txn.test.create({
                  data: {
                    title: `${subModuleProgress.title} test`,
                    user: { connect: { id: userId } },
                    subModuleProgress: {
                      connect: { id: subModuleProgress.id },
                    },
                  },
                });

                await txn.checkpoint.create({
                  data: {
                    title: `${subModuleProgress.title} checkpoint`,
                    user: { connect: { id: userId } },
                    subModuleProgress: {
                      connect: { id: subModuleProgress.id },
                    },
                  },
                });
              }
            })
          );

          /**
           * Create test and checkpoint for module
           */
          if (moduleProgress) {
            await txn.test.create({
              data: {
                title: `${moduleProgress.title} test`,
                user: { connect: { id: userId } },
                moduleProgress: { connect: { id: moduleProgress.id } },
              },
            });

            await txn.checkpoint.create({
              data: {
                title: `${moduleProgress.title} checkpoint`,
                user: { connect: { id: userId } },
                moduleProgress: { connect: { id: moduleProgress.id } },
              },
            });
          }
        })
      );

      /**
       * Create project for the course
       */
      await txn.project.create({
        data: {
          title: `${courseProgress.title} project`,
          slug: course.slug,
          user: { connect: { id: userId } },
          courseProgress: { connect: { id: courseProgress.id } },
        },
      });
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to add course to your catalog, please try again.");
  }
}
