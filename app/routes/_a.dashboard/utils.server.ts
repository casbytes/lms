import { ICourse, ICourseProgress, Status } from "~/constants/types";
import { prisma } from "~/libs/prisma.server";
import { InternalServerError, NotFoundError } from "~/errors";
import { getUser } from "~/services/sessions.server";

/**
 * Get user courses
 * @param {Request} request
 * @returns {Promise<ICourseProgress[]>}
 */
export async function getUserCourses(
  request: Request
): Promise<ICourseProgress[]> {
  const { id: userId } = await getUser(request);
  const userCourses = await prisma.courseProgress.findMany({
    where: {
      users: {
        some: {
          id: userId,
        },
      },
    },
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
      users: {
        some: {
          id: userId,
        },
      },
      NOT: {
        status: Status.COMPLETED,
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
  const { id: userId } = await getUser(request);
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
      throw new NotFoundError("Course not found.");
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
          users: {
            connect: { id: userId },
          },
          project: {
            create: {
              title: `${course.title} project`,
              slug: course.slug,
              contributors: { connect: { id: userId } },
            },
          },
        },
        include: {
          moduleProgress: true,
        },
      });

      /**
       * Create module progress, sub module progress, lesson progress, test * * * checkpoint
       */
      await Promise.all(
        course.modules.map(async (module, index) => {
          const currentOrder = index + 1;
          const moduleProgress = await txn.moduleProgress.create({
            data: {
              title: module.title,
              slug: module.slug,
              order: currentOrder,
              users: { connect: { id: userId } },
              courseProgress: { connect: { id: courseProgress.id } },
              test: {
                create: {
                  title: `${module.title} test`,
                  users: { connect: { id: userId } },
                },
              },
              checkpoint: {
                create: {
                  title: `${module.title} checkpoint`,
                  users: { connect: { id: userId } },
                },
              },
            },
          });

          /**
           * Create sub module progress, lesson progress, test, and checkpoint
           */
          await Promise.all(
            module?.subModules?.map(async (subModule, index) => {
              const currentOrder = index + 1;
              const subModuleProgress = await txn.subModuleProgress.create({
                data: {
                  title: subModule.title,
                  slug: subModule.slug,
                  order: currentOrder,
                  users: { connect: { id: userId } },
                  moduleProgress: { connect: { id: moduleProgress.id } },
                  test: {
                    create: {
                      title: `${subModule.title} test`,
                      users: { connect: { id: userId } },
                    },
                  },
                  checkpoint: {
                    create: {
                      title: `${subModule.title} checkpoint`,
                      users: { connect: { id: userId } },
                    },
                  },
                },
              });

              /**
               * Create lesson progress
               */
              await Promise.all(
                subModule?.lessons?.map(async (lesson, index) => {
                  const currentOrder = index + 1;
                  await txn.lessonProgress.create({
                    data: {
                      title: lesson.title,
                      slug: lesson.slug,
                      order: currentOrder,
                      users: { connect: { id: userId } },
                      subModuleProgress: {
                        connect: { id: subModuleProgress.id },
                      },
                    },
                  });
                })
              );
            })
          );

          /**
           * Create test and checkpoint for module
           */
          if (moduleProgress) {
            await txn.test.create({
              data: {
                title: `${moduleProgress.title} test`,
                moduleProgress: { connect: { id: moduleProgress.id } },
                users: { connect: { id: userId } },
              },
            });

            await txn.checkpoint.create({
              data: {
                title: `${moduleProgress.title} checkpoint`,
                moduleProgress: { connect: { id: moduleProgress.id } },
                users: { connect: { id: userId } },
              },
            });

            const badges = [
              {
                title: "novice",
                unlocked_description: `Awesome work! You've already conquered 25% of the journey and are well on your way to grasping the fundamentals in ${moduleProgress.title}. Keep practicing to unlock more achievements as you continue your learning adventure!`,
                locked_description: `Earn this badge by conquering 25% of the ${moduleProgress.title} roadmap. That means completing all the essential lessons, tests, and sub-module checkpoints along the way`,
              },
              {
                title: "adept",
                unlocked_description: `Congratulations! You've grasped the fundamentals of ${moduleProgress.title} and can tackle most tasks with confidence. Keep exploring to unlock even more achievements!`,
                locked_description: `Earn this badge by conquering 50% of the ${moduleProgress.title} roadmap. That means completing all the essential lessons, tests, and sub-module checkpoints along the way`,
              },
              {
                title: "proficient",
                unlocked_description: `Congratulations! You've leveled up your skills and earned the proficient badge. Now you possess a solid grasp of the concepts and can confidently put them to work in real-world situations. Keep pushing forward to unlock even more achievements and reach mastery!`,
                locked_description: `Earn this badge by conquering 75% of the ${moduleProgress.title} roadmap. That means completing all the essential lessons, tests, and sub-module checkpoints along the way`,
              },
              {
                title: "virtuoso",
                unlocked_description: `Congratulations! You've mastered ${moduleProgress.title}, conquering even the most intricate challenges. With your newfound skills, you're now an inspiration to others. Now, it's time to claim your expertise with official certification. Keep going to complete the course and become certified!`,
                locked_description: `Earn this badge by conquering 100% of the ${moduleProgress.title} roadmap. That means completing all the essential lessons, tests, and sub-module checkpoints along the way`,
              },
            ];

            await txn.badge.createMany({
              data: badges.map((badge) => ({
                title: badge.title,
                locked_description: badge.locked_description,
                unlocked_description: badge.unlocked_description,
                level: badge.title.toUpperCase(),
                moduleProgressId: moduleProgress.id,
                userId,
              })),
            });
          }
        })
      );
    });
  } catch (error) {
    console.error(error);
    throw new InternalServerError(
      "An error occurred while adding course to catalog, please try again."
    );
  }
}
