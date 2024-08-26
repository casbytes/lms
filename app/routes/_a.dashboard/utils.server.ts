import invariant from "tiny-invariant";
import {
  prisma,
  type Course,
  type Module,
  type Prisma,
  type SubModule,
} from "~/utils/db.server";
import { getUserId } from "~/utils/session.server";
import { cache } from "~/utils/node-cache.server";
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { STATUS } from "~/utils/helpers";
import {
  getMetaCourseById,
  getMetaCourses,
  getMetaModuleById,
  getMetaModules,
} from "~/services/sanity/index.server";
import {
  MetaCourse,
  MetaLesson,
  MetaModule,
  MetaSubModule,
} from "~/services/sanity/types";

const today = startOfDay(new Date());

type TimeUnit = "days" | "weeks" | "months";
interface TimeRange {
  start: Date;
  end: Date;
}
export interface TimeData {
  date: string;
  hours: number;
}

/**
 * Generate date ranges for a given time unit and length
 * @param {TimeUnit} unit - The time unit
 * @param {number} length - The length
 * @returns {TimeRange[]} - The date ranges
 */
function generateDateRanges(unit: TimeUnit, length: number): TimeRange[] {
  const ranges: TimeRange[] = [];

  for (let i = 0; i < length; i++) {
    let start: Date;
    let end: Date;

    switch (unit) {
      case "days":
        start = subDays(startOfDay(today), i);
        end = startOfDay(start);
        break;
      case "weeks":
        start = subWeeks(startOfWeek(today), i);
        end = endOfWeek(start);
        break;
      case "months":
        start = subMonths(startOfMonth(today), i);
        end = endOfMonth(start);
        break;
    }
    ranges.push({ start, end });
  }
  return ranges.reverse();
}

/**
 * Get learning data for a user
 * @param {Request} request - The incoming request
 * @param {TimeUnit} unit - The time unit
 * @param {number} length - The length
 * @returns {Promise<TimeData[]>} - The learning data
 */
async function getLearningData(
  request: Request,
  unit: TimeUnit,
  length: number
): Promise<TimeData[]> {
  const userId = await getUserId(request);
  const ranges = generateDateRanges(unit, length);
  const dateCondition = {
    days: subDays(today, 7),
    weeks: subWeeks(startOfWeek(today), 7),
    months: subMonths(startOfMonth(today), 6),
  }[unit];

  const learningTimes = await prisma.learningTime.findMany({
    where: { userId, date: { gte: dateCondition } },
    orderBy: { date: "asc" },
  });

  return ranges.map(({ start, end }) => {
    const totalHours = learningTimes
      .filter((lh) => lh.date >= start && lh.date <= end)
      .reduce((sum, { hours }) => sum + hours, 0);

    const formattedDate = {
      days: format(start, "MMM d"),
      weeks: `${format(start, "MMM d")}-${format(end, "MMM d")}`,
      months: format(start, "MMM yyyy"),
    }[unit];

    return { date: formattedDate, hours: totalHours };
  });
}

/**
 * Get user learning time from the cache or database
 * @param {Request} request - The incoming request
 * @returns {Promise<TimeData[]>} - The learning time
 */
export async function getLearningTime(request: Request): Promise<TimeData[]> {
  const url = new URL(request.url);
  const filter = (url.searchParams.get("filter") as TimeUnit) ?? "days";
  const cacheKey = `learningTime-${filter}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) as TimeData[];
  }

  const result = await getLearningData(
    request,
    filter,
    { days: 7, weeks: 8, months: 6 }[filter]
  );
  cache.set<TimeData[]>(cacheKey, result, 5000);
  return result;
}

/**
 * Get user courses
 * @param {Request} request
 * @returns {Promise<ICourse[]>}
 */
export async function getUserCourses(request: Request): Promise<Course[]> {
  const userId = await getUserId(request);
  return prisma.course.findMany({
    where: { users: { some: { id: userId } } },
  });
}

/**
 * Get user modules
 * @param {Request} request - The incoming request
 * @returns {Promise<ICourse[]>} - The user modules
 */
export async function getUserModules(request: Request): Promise<Module[]> {
  const url = new URL(request.url);
  const search = url.searchParams.get("userModule") ?? "";
  const userId = await getUserId(request);
  return prisma.module.findMany({
    where: {
      OR: [{ title: { contains: search }, slug: { contains: search } }],
      users: { some: { id: userId } },
    },
    include: { course: true },
    orderBy: { order: "asc" },
  });
}

/**
 * Check if a user has a course or module in progress
 * @param {String} userId
 * @returns {Promise<Boolean>}
 */
export async function checkCatalog(userId: string): Promise<boolean> {
  const [coursesCount, modulesCount] = await Promise.all([
    prisma.course.count({
      where: {
        users: { some: { id: userId } },
        NOT: { status: STATUS.COMPLETED },
      },
    }),
    prisma.module.count({
      where: {
        users: { some: { id: userId } },
        NOT: { status: STATUS.COMPLETED },
      },
    }),
  ]);

  return coursesCount > 0 || modulesCount > 0;
}

/**
 * Get courses
 * @param {Request} request - The incoming request
 * @returns {Promise<{ courses: ICourse[], inCatalog: Boolean }>}
 */
export async function getCourses(
  request: Request
): Promise<{ courses: MetaCourse[]; inCatalog: boolean }> {
  try {
    const userId = await getUserId(request);
    const inCatalog = await checkCatalog(userId);
    const courses = await getMetaCourses();
    return { courses, inCatalog };
  } catch (error) {
    throw error;
  }
}

export async function getModules(
  request: Request
): Promise<{ modules: MetaModule[]; inCatalog: boolean }> {
  const userId = await getUserId(request);
  const url = new URL(request.url);
  const searchTerm = url.searchParams.get("module") ?? "";
  try {
    const modules = await getMetaModules(searchTerm);

    const inCatalog = await checkCatalog(userId);
    return { modules, inCatalog };
  } catch (error) {
    throw error;
  }
}

//##########
//ACTIONS
//##########
export async function handleActions(request: Request) {
  const { userId, itemId, intent } = await getFormData(request);
  invariant(intent, "Invalid form data.");

  switch (intent) {
    case "deleteCourse":
      return await deleteCourse(itemId, userId);

    case "deleteModule":
      return await deleteModule(itemId, userId);

    case "addModuleToCatalog":
      return await addModuleToCatalog(itemId, userId);

    case "addCourseToCatalog":
      return await addCourseToCatalog(itemId, userId);
    default:
      throw new Error("Invalid intent.");
  }
}

async function getFormData(request: Request) {
  const formData = await request.formData();
  return {
    userId: await getUserId(request),
    itemId: formData.get("itemId") as string,
    intent: formData.get("intent") as
      | "addCourseToCatalog"
      | "addModuleToCatalog"
      | "deleteCourse"
      | "deleteModule",
  };
}

async function deleteCourse(courseId: string, userId: string) {
  try {
    await prisma.course.delete({
      where: { id: courseId, users: { some: { id: userId } } },
    });
    return formatResponse({ success: true, itemName: "Course" });
  } catch (error) {
    return formatResponse({ success: false, itemName: "Course" });
  }
}

async function deleteModule(moduleId: string, userId: string) {
  try {
    await prisma.module.delete({
      where: { id: moduleId, users: { some: { id: userId } } },
    });
    return formatResponse({ success: true, itemName: "Module" });
  } catch (error) {
    return formatResponse({ success: false, itemName: "Module" });
  }
}

async function addModuleToCatalog(moduleId: string, userId: string) {
  const metaModule = await getMetaModuleById(moduleId);
  try {
    return await prisma.$transaction(async (txn) => {
      const existingModule = await txn.module.findFirst({
        where: { title: metaModule.title, users: { some: { id: userId } } },
      });

      if (existingModule) {
        return formatResponse({ success: false, itemName: "Module" });
      }

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

      await Promise.all([
        createSubModules(txn, metaModule.subModules, module, userId),
        createBadges(txn, module, userId),
      ]);
      return formatResponse({ success: true, itemName: "Module" });
    });
  } catch (error) {
    return formatResponse({ success: false, itemName: "Module" });
  }
}

/**
 * Add a course to a user's catalog
 * @param {String} userId - The user ID
 * @param {String} courseId - The course ID
 * @returns {Promise<void>}
 */
export async function addCourseToCatalog(courseId: string, userId: string) {
  try {
    const metaCourse = await getMetaCourseById(courseId);
    return await prisma.$transaction(async (txn) => {
      const existingCourse = await txn.course.findFirst({
        where: { title: metaCourse.title, users: { some: { id: userId } } },
      });
      if (existingCourse) {
        return formatResponse({ success: false, itemName: "Course" });
      }
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
      return formatResponse({ success: true, itemName: "Course" });
    });
  } catch (error) {
    return formatResponse({ success: false, itemName: "Course" });
  }
}

/**
 * Create module progresses
 * @param {Prisma.TransactionClient} txn - The transaction client
 * @param {MetaModule[]} metaModules - The modules
 * @param {Course} course - The course progress
 * @param {String} userId - The user ID
 * @returns {Promise<void>}
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
 * Upsert module progress
 * @param {Prisma.TransactionClient} txn - The transaction client
 * @param {MetaModule} metaModule - The module
 * @param {number} moduleIndex - The module index
 * @param {string} courseId - The course progress ID
 * @param {string} userId - The user ID
 * @returns {Promise}
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
 * Create sub module progresses
 * @param {Prisma.TransactionClient} txn - The transaction client
 * @param {MetaModule[]} metaSubModules - The sub modules
 * @param {Module} module - The module progress
 * @param {String} userId - The user ID
 * @returns {Promise<void>}
 */
async function createSubModules(
  txn: Prisma.TransactionClient,
  metaSubModules: MetaSubModule[],
  module: Module,
  userId: string
) {
  try {
    for (const [subModuleIndex, metaSubModule] of metaSubModules.entries()) {
      const subModule = await upsertSubModule(
        txn,
        metaSubModule,
        subModuleIndex,
        module.id,
        userId
      );
      await createLessons(txn, metaSubModule.lessons, subModule, userId);
      return subModule;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Upsert sub module progress
 * @param {Prisma.TransactionClient} txn - The transaction client
 * @param {MetaSubModule} metaSubModule - The sub module
 * @param {number} subModuleIndex - The sub module index
 * @param {string} moduleId - The module progress ID
 * @param {string} userId - The user ID
 * @returns {Promise<SubModule>}
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
 * Create lesson progresses
 * @param {Prisma.TransactionClient} txn - The transaction client
 * @param {MetaLesson[]} metaLessons - The lessons
 * @param {SubModule} subModule - The sub module progress
 * @param {String} userId - The user ID
 * @returns {Promise<void>}
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

/**
 * Create badges
 * @param {Prisma.TransactionClient} txn - The transaction client
 * @param {Module} module - The module
 * @param {String} userId - The user ID
 * @returns {Promise<void>}
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
 * Format response
 */
function formatResponse({
  success,
  itemName,
}: {
  success: boolean;
  itemName: string;
}) {
  if (success) {
    return { success: true, message: `${itemName} added to catalog` };
  } else {
    return { success: false, message: `Failed to add ${itemName} to catalog` };
  }
}
