import { MetaLesson, MetaModule, MetaSubModule } from "~/services/sanity/types";
import { Course, Module, Prisma, prisma, SubModule } from "./db.server";
import { STATUS, TEST_STATUS } from "./helpers";
import { formatResponse } from "./helpers.server";
import {
  getMetaCourseById,
  getMetaModuleById,
} from "~/services/sanity/index.server";

/**
 * Add a course to the user's catalog
 * @param {String} courseId - The course ID
 * @param {String} userId - The user ID
 * @returns {Promise<{success: boolean, message: string}>}
 * 
 * @example
 * const response = await addCourseToCatalog("course_123", "user_456");
 * console.log(response);
 */
export async function addCourseToCatalog(courseId: string, userId: string) {
  try {
    const metaCourse = await getMetaCourseById(courseId);
    return await prisma.$transaction(async (txn) => {
      const course = await txn.course.create({
        data: {
          title: metaCourse.title,
          slug: metaCourse.slug,
          users: { connect: { id: userId } },
          project: {
            create: {
              title: `${metaCourse.title} project`,
              testEnvironment: metaCourse?.testEnvironment,
              slug: metaCourse.slug,
              contributors: { connect: { id: userId } },
            },
          },
        },
      });

      await createModule(txn, metaCourse.modules, course, userId);
      return formatResponse(true, `${course.title} added to catalog`);
    });
  } catch (error) {
    return formatResponse(
      false,
      `An error occured while adding course to catalog.`
    );
  }
}

/**
 * Add a module to the user's catalog
 * @param {String} moduleId - The module ID
 * @param {String} userId - The user ID
 * @returns {Promise<{success: boolean, message: string}>}
 * 
 * @example
 * const response = await addModuleToCatalog("module_123", "user_456");
 * console.log(response);
 */
export async function addModuleToCatalog(moduleId: string, userId: string) {
  const metaModule = await getMetaModuleById(moduleId);

  try {
    return await prisma.$transaction(async (txn) => {
      const module = await txn.module.create({
        data: {
          title: metaModule.title,
          slug: metaModule.slug,
          users: { connect: { id: userId } },
          status: STATUS.IN_PROGRESS,
          order: 1,
          test: {
            create: {
              title: `${metaModule.title} test`,
              users: { connect: { id: userId } },
            },
          },
          checkpoint: metaModule?.checkpoint
            ? {
                create: {
                  title: `${metaModule.title} checkpoint`,
                  users: { connect: { id: userId } },
                },
              }
            : undefined,
        },
      });

      await createSubModules(txn, metaModule.subModules, module, userId);
      await createBadges(txn, module, userId);
      return formatResponse(true, `${module.title} added to catalog`);
    });
  } catch (error) {
    return formatResponse(
      false,
      `An error occured while adding course to catalog.`
    );
  }
}

/**
 * Update the module score
 * @param {String} moduleId - The module ID
 * @param {String} userId - The user ID
 * @returns {Promise<void>}
 * @throws {Error} If an error occurs while updating the module score
 * 
 * @example
 *  await updateModuleScore("module_123", "user_456");
 */
async function updateModule(moduleId: string, userId: string) {
  try {
    const [testAggregate, testCount, checkpointAggregate, checkpointCount] =
      await Promise.all([
        prisma.test.aggregate({
          _sum: { score: true },
          where: { moduleId },
        }),
        prisma.test.count({ where: { moduleId } }),

        prisma.checkpoint.aggregate({
          _sum: { score: true },
          where: { moduleId },
        }),
        prisma.checkpoint.count({ where: { moduleId } }),
      ]);

    const totalTestsScore = testAggregate._sum.score || 0;
    const totalCheckpointsScore = checkpointAggregate._sum.score || 0;
    const totalItems = testCount + checkpointCount;

    // Ensure scores are normalized (assuming scores are out of 100)
    const normalizedTestScore = totalTestsScore / testCount || 0;
    const normalizedCheckpointScore =
      totalCheckpointsScore / checkpointCount || 0;

    const denominator = testCount > 0 && checkpointCount > 0 ? 2 : 1;

    // Calculate the average score and convert it to a percentage
    const totalScore =
      totalItems > 0
        ? Math.round(
            (normalizedTestScore + normalizedCheckpointScore) / denominator
          )
        : 0;

    await prisma.module.update({
      where: { id: moduleId, users: { some: { id: userId } } },
      data: { score: totalScore },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Update the module status and find the next module
 * @param {String} moduleId - The module ID
 * @param {String} userId - The user ID
 * @returns {Promise<void>}
 * @throws {Error} If an error occurs while updating the module status
 * 
 * @example
 * await updateModuleStatusAndFindNextModule("module_123", "user_456");
 */
export async function updateModuleStatusAndFindNextModule({
  moduleId,
  userId,
}: {
  moduleId: string;
  userId: string;
}) {
  try {
    //Get the module
    const module = await prisma.module.findUniqueOrThrow({
      where: { id: moduleId, users: { some: { id: userId } } },
      select: { id: true, order: true, courseId: true },
    });

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { subscribed: true },
    });

    //Update the module status to COMPLETED
    await prisma.module.update({
      where: { id: module.id, users: { some: { id: userId } } },
      data: { status: STATUS.COMPLETED },
    });
    await updateCourse(module.courseId!, userId);

    //Find the next module
    if (user.subscribed) {
      await prisma.$transaction(async (prisma) => {
        const nextModule = await prisma.module.findFirst({
          where: {
            order: { equals: module.order + 1 },
            users: { some: { id: userId } },
          },
          select: { id: true },
        });
        if (nextModule) {
          await prisma.module.update({
            where: { id: nextModule.id, users: { some: { id: userId } } },
            data: { status: STATUS.IN_PROGRESS },
          });
        } else {
          if (module.courseId) {
            await updateCourseProject(module.courseId, userId);
          }
        }
      });
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Create module progress
 * @param {Prisma.TransactionClient} txn - The transaction client
 * @param {MetaModule[]} metaModules - The modules
 * @param {Course} course - The course
 * @param {String} userId - The user ID
 * @returns {Promise<void>}
 * @throws {Error} If an error occurs while creating the module progress
 * 
 * @example
 * await createModule(txn, metaModules, course, "user_123");
 */
async function createModule(
  txn: Prisma.TransactionClient,
  metaModules: MetaModule[],
  course: Course,
  userId: string
): Promise<void> {
  try {
    for (const [moduleIndex, metaModule] of metaModules.entries()) {
      const module = await upsertModule(
        txn,
        metaModule,
        moduleIndex,
        course.id,
        userId
      );
      await createSubModules(txn, metaModule.subModules, module, userId);
      await createBadges(txn, module, userId);
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Upsert  module 
 * @param {Prisma.TransactionClient} txn - The transaction client
 * @param {MetaModule} metaModule - The module
 * @param {number} moduleIndex - The module index
 * @param {string} courseId - The course ID
 * @param {string} userId - The user ID
 * @returns {Promise<Module>}
 * @throws {Error} If an error occurs while upserting the module
 * 
 * @example
 * const module = await upsertModule(txn, metaModule, moduleIndex, courseId, "user_123");
 * console.log(module);
 */
async function upsertModule(
  txn: Prisma.TransactionClient,
  metaModule: MetaModule,
  moduleIndex: number,
  courseId: string,
  userId: string
) {
  try {
    const existingModule = await txn.module.findFirst({
      where: { title: metaModule.title, users: { some: { id: userId } } },
    });

    if (existingModule) {
      return txn.module.update({
        where: { id: existingModule.id },
        data: {
          courseId,
          premium: moduleIndex !== 0,
          status: existingModule.status,
          order: moduleIndex + 1,
        },
      });
    } else {
      return txn.module.create({
        data: {
          title: metaModule.title,
          slug: metaModule.slug,
          premium: moduleIndex !== 0,
          order: moduleIndex + 1,
          users: { connect: { id: userId } },
          course: { connect: { id: courseId } },
          test: {
            create: {
              title: `${metaModule.title} test`,
              users: { connect: { id: userId } },
            },
          },
          checkpoint: metaModule?.checkpoint
            ? {
                create: {
                  title: `${metaModule.title} checkpoint`,
                  users: { connect: { id: userId } },
                },
              }
            : undefined,
        },
      });
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Create module badges
 * @param {Prisma.TransactionClient} txn - The transaction client
 * @param {Module} module - The module
 * @param {String} userId - The user ID
 * @returns {Promise<void>}
 * @throws {Error} If an error occurs while creating the badges
 * 
 * @example
 * await createBadges(txn, module, "user_123");
 */
async function createBadges(
  txn: Prisma.TransactionClient,
  module: Module,
  userId: string
): Promise<void> {
  const badges = [
    {
      title: "novice",
      unlocked_description: `Awesome work! You've already conquered 25% of the journey and are well on your way to grasping the fundamentals in ${module.title}. Keep practicing to unlock more achievements as you continue your learning adventure!`,
      locked_description: `Earn this badge by conquering 25% of the ${module.title} roadmap. That means completing all the essential lessons, tests, and sub-module checkpoints along the way`,
    },
    {
      title: "adept",
      unlocked_description: `Congratulations! You've grasped the fundamentals of ${module.title} and can tackle most tasks with confidence. Keep exploring to unlock even more achievements!`,
      locked_description: `Earn this badge by conquering 50% of the ${module.title} roadmap. That means completing all the essential lessons, tests, and sub-module checkpoints along the way`,
    },
    {
      title: "proficient",
      unlocked_description: `Congratulations! You've leveled up your skills and earned the proficient badge. Now you possess a solid grasp of the concepts and can confidently put them to work in real-world situations. Keep pushing forward to unlock even more achievements and reach mastery!`,
      locked_description: `Earn this badge by conquering 75% of the ${module.title} roadmap. That means completing all the essential lessons, tests, and sub-module checkpoints along the way`,
    },
    {
      title: "virtuoso",
      unlocked_description: `Congratulations! You've mastered ${module.title}, conquering even the most intricate challenges. With your newfound skills, you're now an inspiration to others. Now, it's time to claim your expertise with official certification. Keep going to complete the course and become certified!`,
      locked_description: `Earn this badge by conquering 100% of the ${module.title} roadmap. That means completing all the essential lessons, tests, and sub-module checkpoints along the way`,
    },
  ];

  await txn.badge.createMany({
    data: badges.map((badge) => ({
      title: badge.title,
      locked_description: badge.locked_description,
      unlocked_description: badge.unlocked_description,
      level: badge.title.toUpperCase(),
      moduleId: module.id,
      userId,
    })),
  });
}

/**
 * Update the submodule status and find the next submodule
 * @param {String} subModuleId - The submodule ID
 * @param {String} userId - The user ID
 * @returns {Promise<void>}
 * @throws {Error} If an error occurs while updating the submodule status
 * 
 * @example
 * await updateSubmoduleStatusAndFindNextSubmodule("submodule_123", "user_456");
 */
export async function updateSubmoduleStatusAndFindNextSubmodule({
  subModuleId,
  userId,
}: {
  subModuleId: string;
  userId: string;
}) {
  try {
    // Fetch the submodule along with its parent module
    const [subModule, user] = await Promise.all([
      prisma.subModule.findUniqueOrThrow({
        where: { id: subModuleId, users: { some: { id: userId } } },
        include: { module: true },
      }),
      prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: { subscribed: true },
      }),
    ]);

    await prisma.subModule.update({
      where: { id: subModule.id, users: { some: { id: userId } } },
      data: { status: STATUS.COMPLETED },
    });
    await updateModule(subModule.moduleId, userId);

    // Find the next submodule in the sequence
    if (user.subscribed) {
      await prisma.$transaction(async (prisma) => {
        const nextSubmodule = await prisma.subModule.findFirst({
          where: {
            moduleId: subModule.module.id,
            order: { equals: subModule.order + 1 },
            users: { some: { id: userId } },
          },
          select: { id: true },
        });
        if (nextSubmodule) {
          // If there's a next submodule, mark it as in progress
          await prisma.subModule.update({
            where: { id: nextSubmodule.id, users: { some: { id: userId } } },
            data: { status: STATUS.IN_PROGRESS },
          });
        } else {
          // If no more submodules, find the corresponding module test and mark it as available
          const moduleTest = await prisma.test.findFirstOrThrow({
            where: {
              moduleId: subModule.module.id,
              users: { some: { id: userId } },
            },
            select: { id: true },
          });
          await prisma.test.update({
            where: { id: moduleTest.id, users: { some: { id: userId } } },
            data: { status: TEST_STATUS.AVAILABLE },
          });
        }
      });
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Update the course score
 * @param {String} courseId - The course ID
 * @param {String} userId - The user ID
 * @returns {Promise<void>}
 * @throws {Error} If an error occurs while updating the course score
 * 
 * @example
 * await updateCourse("course_123", "user_456");
 */
async function updateCourse(courseId: string, userId: string) {
  try {
    const [moduleScores, totalModules] = await Promise.all([
      prisma.module.aggregate({
        _sum: { score: true },
        where: { courseId },
      }),
      prisma.module.count({ where: { courseId } }),
    ]);

    const totalScore =
      totalModules > 0
        ? Math.round((moduleScores._sum.score || 0) / totalModules)
        : 0;

    await prisma.course.update({
      where: { id: courseId, users: { some: { id: userId } } },
      data: { score: totalScore },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Update the course project status
 * @param {String} moduleId - The module ID
 * @param {String} userId - The user ID
 * @returns {Promise<void>}
 * @throws {Error} If an error occurs while updating the course project status
 * 
 * @example
 * await updateCourseProject("module_123", "user_456");
 */
async function updateCourseProject(moduleId: string, userId: string) {
  try {
    const course = await prisma.course.findFirstOrThrow({
      where: {
        modules: { some: { id: moduleId } },
        users: { some: { id: userId } },
      },
      include: { project: true },
    });

    if (!course?.project) throw new Error("Project not found.");
    await prisma.project.update({
      where: { id: course.project.id, contributors: { some: { id: userId } } },
      data: { status: STATUS.IN_PROGRESS },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Create  sub modules
 * @param {Prisma.TransactionClient} txn - The transaction client
 * @param {MetaSubModule[]} metaSubModules - The sub modules
 * @param {Module} module - The module
 * @param {String} userId - The user ID
 * @returns {Promise<SubModule[]>}
 * @throws {Error} If an error occurs while creating the sub modules
 * 
 * @example
 * const subModules = await createSubModules(txn, metaSubModules, module, "user_123");
 * console.log(subModules);
 */
async function createSubModules(
  txn: Prisma.TransactionClient,
  metaSubModules: MetaSubModule[],
  module: Module,
  userId: string
) {
  try {
    const createdSubModules = Array(metaSubModules.length).fill(null);
    for (const [subModuleIndex, metaSubModule] of metaSubModules.entries()) {
      const subModule = await upsertSubModule(
        txn,
        metaSubModule,
        subModuleIndex,
        module.id,
        userId
      );
      await createLessons(txn, metaSubModule.lessons, subModule, userId);
      createdSubModules.push(subModule);
    }
    return createdSubModules;
  } catch (error) {
    throw error;
  }
}

/**
 * Upsert sub module 
 * @param {Prisma.TransactionClient} txn - The transaction client
 * @param {MetaSubModule} metaSubModule - The sub module
 * @param {number} subModuleIndex - The sub module index
 * @param {string} moduleId - The module ID
 * @param {string} userId - The user ID
 * @returns {Promise<SubModule>}
 * @throws {Error} If an error occurs while upserting the sub module
 * 
 * @example
 * const subModule = await upsertSubModule(txn, metaSubModule, subModuleIndex, moduleId, "user_123");
 * console.log(subModule);
 */
async function upsertSubModule(
  txn: Prisma.TransactionClient,
  metaSubModule: MetaSubModule,
  subModuleIndex: number,
  moduleId: string,
  userId: string
) {
  const existingSubModule = await txn.subModule.findFirst({
    where: { title: metaSubModule.title, users: { some: { id: userId } } },
  });

  if (existingSubModule) {
    return txn.subModule.update({
      where: { id: existingSubModule.id },
      data: {
        moduleId,
        order: subModuleIndex + 1,
      },
    });
  } else {
    return txn.subModule.create({
      data: {
        title: metaSubModule.title,
        slug: metaSubModule.slug,
        order: subModuleIndex + 1,
        users: { connect: { id: userId } },
        module: { connect: { id: moduleId } },
        test: {
          create: {
            title: `${metaSubModule.title} test`,
            users: { connect: { id: userId } },
          },
        },
        checkpoint: metaSubModule?.checkpoint
          ? {
              create: {
                title: `${metaSubModule.title} checkpoint`,
                users: { connect: { id: userId } },
              },
            }
          : undefined,
      },
    });
  }
}

/**
 * Create lessons
 * @param {Prisma.TransactionClient} txn - The transaction client
 * @param {MetaLesson[]} metaLessons - The lessons
 * @param {SubModule} subModule - The sub module 
 * @param {String} userId - The user ID
 * @returns {Promise<void>}
 * @throws {Error} If an error occurs while creating the lessons
 * 
 * @example
 * await createLessons(txn, metaLessons, subModule, "user_123");
 */
async function createLessons(
  txn: Prisma.TransactionClient,
  metaLessons: MetaLesson[],
  subModule: SubModule,
  userId: string
): Promise<void> {
  for (const [lessonIndex, metaLesson] of metaLessons.entries()) {
    const existingLesson = await txn.lesson.findFirst({
      where: { title: metaLesson.title, users: { some: { id: userId } } },
    });

    if (existingLesson) {
      await txn.lesson.update({
        where: { id: existingLesson.id },
        data: {
          subModuleId: subModule.id,
          order: lessonIndex + 1,
        },
      });
    } else {
      await txn.lesson.create({
        data: {
          title: metaLesson.title,
          slug: metaLesson.slug,
          order: lessonIndex + 1,
          users: { connect: { id: userId } },
          subModule: { connect: { id: subModule.id } },
        },
      });
    }
  }
}
