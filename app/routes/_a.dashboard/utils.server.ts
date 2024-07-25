import invariant from "tiny-invariant";
import slugify from "slugify";
import {
  CourseProgress,
  ModuleProgress,
  Prisma,
  SubModuleProgress,
  prisma,
} from "~/utils/db.server";
import { getUserId } from "~/utils/session.server";
import { octokit } from "~/utils/octokit.server";
import { cache } from "~/utils/node-cache.server";
import { Status } from "~/constants/enums";
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

type GM = "AUTO" | "MANUAL";
export interface Course {
  title: string;
  id: string;
  published: boolean;
  modules: Module[];
}
export interface Module {
  title: string;
  id: string;
  gradingMethod: GM;
  subModules: SubModule[];
}
export interface SubModule {
  title: string;
  id: string;
  gradingMethod: GM;
  lessons: Lesson[];
}
export interface Lesson {
  title: string;
  id: string;
}

const date = new Date();
const today = startOfDay(date);

/**
 * Get learning time in hours
 * @param request - The incoming request
 * @returns {Promise<{ date: string, hours: number }[]>} - The learning time in hours
 */
async function getLearningHours(request: Request) {
  const lastWeek = Array.from({ length: 7 }, (_, i) =>
    subDays(today, i)
  ).reverse();

  try {
    const userId = await getUserId(request);
    const learningTimes = await prisma.learningTime.findMany({
      where: {
        userId,
        date: {
          gte: subDays(today, 7),
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    const formattedHours = lastWeek.map((date) => {
      const entry = learningTimes.find((lh) =>
        lh.date.toISOString().startsWith(date.toISOString().slice(0, 10))
      );

      return {
        date: format(date, "MMM d"),
        hours: Number(entry?.hours.toFixed(2) ?? 0),
      };
    });
    return formattedHours;
  } catch (error) {
    throw error;
  }
}

/**
 * Get learning time in weeks
 * @param request - The incoming request
 * @returns {Promise<{ date: string, hours: number }[]>} - The learning time in weeks
 */
async function getLearningWeeks(request: Request) {
  const startOfCurrentWeek = startOfWeek(today);

  const weeks = Array.from({ length: 8 }, (_, i) =>
    subWeeks(startOfCurrentWeek, i)
  ).reverse();

  try {
    const userId = await getUserId(request);
    const learningTime = await prisma.learningTime.findMany({
      where: {
        userId,
        date: {
          gte: subWeeks(startOfCurrentWeek, 7),
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    const weeklyData = weeks.map((week) => {
      const weekStart = startOfWeek(week);
      const weekEnd = endOfWeek(week);
      const weekHours = learningTime.filter(
        (lh) => lh.date >= weekStart && lh.date <= weekEnd
      );
      const totalHours = weekHours.reduce((sum, entry) => sum + entry.hours, 0);
      return {
        date: format(week, "MMM d"),
        hours: Number(totalHours.toFixed(2)),
      };
    });
    return weeklyData;
  } catch (error) {
    throw error;
  }
}

/**
 * Get learning time in months
 * @param request - The incoming request
 * @returns {Promise<{ date: string, hours: number }[]>} - The learning time in months
 */
async function getLearningMonths(request: Request) {
  const startOfCurrentMonth = startOfMonth(today);
  const currentMonth = date.getMonth();

  const months = Array.from({ length: currentMonth + 1 }, (_, i) =>
    subMonths(startOfCurrentMonth, i)
  ).reverse();

  try {
    const userId = await getUserId(request);
    const learningTime = await prisma.learningTime.findMany({
      where: {
        userId,
        date: {
          gte: subMonths(startOfCurrentMonth, 6),
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    const monthlyData = months.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthHours = learningTime.filter(
        (lh) => lh.date >= monthStart && lh.date <= monthEnd
      );
      const totalHours = monthHours.reduce(
        (sum, entry) => sum + entry.hours,
        0
      );
      return {
        date: format(month, "MMM yyyy"),
        hours: Number(totalHours.toFixed(2)),
      };
    });
    return monthlyData;
  } catch (error) {
    throw error;
  }
}

export type TimeData = {
  date: string;
  hours: number;
};

/**
 * Get learning time
 * @param {Request} request - The incoming request
 * @returns {Promise<TimeData[]>} - The learning time
 */
export async function getLearningTime(request: Request) {
  const url = new URL(request.url);
  const filter =
    (url.searchParams.get("filter") as "days" | "weeks" | "months") ?? "days";

  const cacheKey = `learningTime-${filter}`;
  const cachedTimeData = cache.get<TimeData[]>(cacheKey);
  if (cachedTimeData) {
    return cachedTimeData;
  }

  try {
    let result: TimeData[];
    switch (filter) {
      case "days":
        result = await getLearningHours(request);
        break;
      case "weeks":
        result = await getLearningWeeks(request);
        break;
      case "months":
        result = await getLearningMonths(request);
        break;
      default:
        result = await getLearningHours(request);
        break;
    }
    cache.set<TimeData[]>(cacheKey, result, 5000);
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Get user courses
 * @param {Request} request
 * @returns {Promise<ICourseProgress[]>}
 */
export async function getUserCourses(
  request: Request
): Promise<CourseProgress[]> {
  try {
    const userId = await getUserId(request);
    const userCourses = await prisma.courseProgress.findMany({
      where: { users: { some: { id: userId } } },
    });
    return userCourses;
  } catch (error) {
    throw error;
  }
}

/**
 * Get user modules
 * @param {Request} request - The incoming request
 * @returns {Promise<ICourseProgress[]>} - The user modules
 */
export async function getUserModules(
  request: Request
): Promise<ModuleProgress[]> {
  try {
    const userId = await getUserId(request);
    const userModules = await prisma.moduleProgress.findMany({
      where: { users: { some: { id: userId } } },
      include: {
        courseProgress: true,
      },
      orderBy: {
        order: "asc",
      },
    });
    return userModules;
  } catch (error) {
    throw error;
  }
}

/**
 * Check if a user has a course or module in progress
 * @param {String} userId
 * @returns {Promise<Boolean>}
 */
export async function checkCatalog(userId: string): Promise<boolean> {
  const [courses, modules] = await Promise.all([
    prisma.courseProgress.findMany({
      where: {
        users: { some: { id: userId } },
        NOT: { status: Status.COMPLETED },
      },
    }),
    prisma.moduleProgress.findMany({
      where: {
        users: { some: { id: userId } },
        NOT: { status: Status.COMPLETED },
      },
    }),
  ]);
  return courses.length > 0 || modules.length > 0;
}

/**
 * Octokit credentials
 */
const octokitCredentials = {
  owner: process.env.GITHUB_OWNER,
  repo: "meta",
  path: "build",
};

/**
 * Get courses meta data from the GitHub
 * @returns {Promise<ICourse[]>}
 */
async function getMeta() {
  try {
    const { data } = await octokit.repos.getContent(octokitCredentials);
    if (!Array.isArray(data)) {
      throw new Error("Invalid meta data.");
    }
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get file content from GitHub
 * @param {String} path - The file path
 * @returns {Promise<String>} - The file content
 */
async function getFileContent(path: string) {
  try {
    const { data } = await octokit.repos.getContent({
      ...octokitCredentials,
      path,
    });
    if (typeof data !== "object" || !("content" in data)) {
      throw new Error("Invalid file content.");
    }
    return Buffer.from(data.content, "base64").toString("utf8");
  } catch (error) {
    throw error;
  }
}

// Reuse the courses array in the addCourseToCatalog function and addModuleToCatalog function
const courses: Course[] = [];

/**
 * Get courses
 * @param {Request} request - The incoming request
 * @returns {Promise<{ courses: ICourse[], inCatalog: Boolean }>}
 */
export async function getCourses(
  request: Request
): Promise<{ courses: Course[]; inCatalog: boolean }> {
  try {
    const userId = await getUserId(request);
    const inCatalog = await checkCatalog(userId);

    const cachedCourses = cache.get<Course[]>("courses");
    if (cachedCourses) {
      for (const cachedCourse of cachedCourses) {
        courses.push(cachedCourse);
      }
      return { courses: cachedCourses, inCatalog };
    }

    const meta = await getMeta();
    for (const folder of meta) {
      const jsonContent = await getFileContent(folder.path);
      const course = JSON.parse(jsonContent);
      //Prevent duplicate courses
      if (!courses.find((c) => c.id === course.id)) {
        courses.push(course);
      }
    }
    cache.set<Course[]>("courses", courses);
    return { courses, inCatalog };
  } catch (error) {
    throw error;
  }
}

//##########
//ACTIONS
//##########
export async function handleActions(request: Request) {
  const formData = await request.formData();
  const userId = await getUserId(request);
  const intent = formData.get("intent") as
    | "addCourseToCatalog"
    | "addModuleToCatalog"
    | "deleteCourse"
    | "deleteModule";
  invariant(intent, "Invalid form data.");

  switch (intent) {
    case "deleteCourse":
      return await deleteCourse(formData, userId);

    case "deleteModule":
      return await deleteModule(formData, userId);

    case "addModuleToCatalog":
      return await addModuleToCatalog(formData, userId);

    case "addCourseToCatalog":
      return await addCourseToCatalog(formData, userId);
    default:
      throw new Error("Invalid intent.");
  }
}

async function deleteCourse(formData: FormData, userId: string) {
  try {
    const courseId = String(formData.get("itemId"));
    await prisma.courseProgress.delete({
      where: { id: courseId, users: { some: { id: userId } } },
    });
    return { success: true, message: "Course deleted from catalog." };
  } catch (error) {
    return { success: false, message: "Failed to delete course from catalog." };
  }
}

async function deleteModule(formData: FormData, userId: string) {
  try {
    const moduleId = String(formData.get("itemId"));
    await prisma.moduleProgress.delete({
      where: { id: moduleId, users: { some: { id: userId } } },
    });
    return { success: true, message: "Module deleted from catalog." };
  } catch (error) {
    return { success: false, message: "Failed to delete module from catalog." };
  }
}

async function addModuleToCatalog(formData: FormData, userId: string) {
  const moduleId = formData.get("itemId") as string;
  invariant(moduleId, "Module ID is required.");

  let module: Module | undefined;
  for (const course of courses) {
    module = course.modules.find((m) => m.id === String(moduleId));
    if (module) break;
  }
  invariant(module, "Module not found.");

  try {
    return await prisma.$transaction(async (txn) => {
      const existingModuleProgress = await txn.moduleProgress.findFirst({
        where: { title: module.title, users: { some: { id: userId } } },
      });

      if (existingModuleProgress) {
        return { success: false, message: "Module already in catalog" };
      }

      const moduleProgress = await txn.moduleProgress.create({
        data: {
          title: module.title,
          slug: slugify(module.title, { lower: true }),
          users: { connect: { id: userId } },
          status: Status.IN_PROGRESS,
          order: 1,
          test: {
            create: {
              title: `${module.title} test`,
              users: { connect: { id: userId } },
            },
          },
          checkpoint: {
            create: {
              title: `${module.title} checkpoint`,
              gradingMethod: module?.gradingMethod,
              users: { connect: { id: userId } },
            },
          },
        },
      });

      await Promise.all([
        createSubModuleProgresses(
          txn,
          module.subModules,
          moduleProgress,
          userId
        ),
        createBadges(txn, moduleProgress, userId),
      ]);
      return { success: true, message: "Module added to catalog" };
    });
  } catch (error) {
    return { success: false, message: "Failed to add module to catalog" };
  }
}

/**
 * Add a course to a user's catalog
 * @param {String} userId - The user ID
 * @param {String} courseId - The course ID
 * @returns {Promise<void>}
 */
export async function addCourseToCatalog(formData: FormData, userId: string) {
  try {
    const courseId = formData.get("itemId") as string;
    invariant(courseId, "Course ID is required.");
    const course = courses.find((c) => c.id === String(courseId));
    invariant(course, "Course not found.");

    return await prisma.$transaction(async (txn) => {
      const existingCourseProgress = await txn.courseProgress.findFirst({
        where: { id: course.title, users: { some: { id: userId } } },
      });
      if (existingCourseProgress) {
        return { success: false, message: "Course already in catalog" };
      }
      const courseProgress = await txn.courseProgress.create({
        data: {
          title: course.title,
          slug: slugify(course.title, { lower: true }),
          users: { connect: { id: userId } },
          project: {
            create: {
              title: `${course.title} project`,
              slug: slugify(course.title, { lower: true }),
              contributors: { connect: { id: userId } },
            },
          },
        },
        include: { moduleProgress: true },
      });

      await createModuleProgresses(txn, course.modules, courseProgress, userId);
      return { success: true, message: "Course added to catalog" };
    });
  } catch (error) {
    return { success: false, message: "Failed to add course to catalog" };
  }
}

/**
 * Create module progresses
 * @param {Prisma.TransactionClient} txn - The transaction client
 * @param {IModule[]} modules - The modules
 * @param {CourseProgress} courseProgress - The course progress
 * @param {String} userId - The user ID
 * @returns {Promise<void>}
 */
async function createModuleProgresses(
  txn: Prisma.TransactionClient,
  modules: Module[],
  courseProgress: CourseProgress,
  userId: string
): Promise<void> {
  for (const [moduleIndex, module] of modules.entries()) {
    const moduleProgress = await upsertModuleProgress(
      txn,
      module,
      moduleIndex,
      courseProgress.id,
      userId
    );
    await createSubModuleProgresses(
      txn,
      module.subModules,
      moduleProgress,
      userId
    );
    await createBadges(txn, moduleProgress, userId);
  }
}

/**
 * Upsert module progress
 * @param {Prisma.TransactionClient} txn - The transaction client
 * @param {Module} module - The module
 * @param {number} moduleIndex - The module index
 * @param {string} courseProgressId - The course progress ID
 * @param {string} userId - The user ID
 * @returns {Promise<ModuleProgress>}
 */
async function upsertModuleProgress(
  txn: Prisma.TransactionClient,
  module: Module,
  moduleIndex: number,
  courseProgressId: string,
  userId: string
): Promise<ModuleProgress> {
  const existingModuleProgress = await txn.moduleProgress.findFirst({
    where: { title: module.title, users: { some: { id: userId } } },
  });

  if (existingModuleProgress) {
    return txn.moduleProgress.update({
      where: { id: existingModuleProgress.id },
      data: {
        courseProgressId,
        premium: moduleIndex !== 0,
        status: existingModuleProgress.status,
        order: moduleIndex + 1,
      },
    });
  } else {
    return txn.moduleProgress.create({
      data: {
        title: module.title,
        slug: slugify(module.title, { lower: true }),
        premium: moduleIndex !== 0,
        order: moduleIndex + 1,
        users: { connect: { id: userId } },
        courseProgress: { connect: { id: courseProgressId } },
        test: {
          create: {
            title: `${module.title} test`,
            users: { connect: { id: userId } },
          },
        },
        checkpoint: {
          create: {
            title: `${module.title} checkpoint`,
            gradingMethod: module?.gradingMethod,
            users: { connect: { id: userId } },
          },
        },
      },
    });
  }
}

/**
 * Create sub module progresses
 * @param {Prisma.TransactionClient} txn - The transaction client
 * @param {ISubModule[]} subModules - The sub modules
 * @param {ModuleProgress} moduleProgress - The module progress
 * @param {String} userId - The user ID
 * @returns {Promise<void>}
 */
async function createSubModuleProgresses(
  txn: Prisma.TransactionClient,
  subModules: SubModule[],
  moduleProgress: ModuleProgress,
  userId: string
) {
  for (const [subModuleIndex, subModule] of subModules.entries()) {
    const subModuleProgress = await upsertSubModuleProgress(
      txn,
      subModule,
      subModuleIndex,
      moduleProgress.id,
      userId
    );
    await createLessonProgresses(
      txn,
      subModule.lessons,
      subModuleProgress,
      userId
    );
    return subModuleProgress;
  }
}

/**
 * Upsert sub module progress
 * @param {Prisma.TransactionClient} txn - The transaction client
 * @param {SubModule} subModule - The sub module
 * @param {number} subModuleIndex - The sub module index
 * @param {string} moduleProgressId - The module progress ID
 * @param {string} userId - The user ID
 * @returns {Promise<SubModuleProgress>}
 */
async function upsertSubModuleProgress(
  txn: Prisma.TransactionClient,
  subModule: SubModule,
  subModuleIndex: number,
  moduleProgressId: string,
  userId: string
) {
  const existingSubModuleProgress = await txn.subModuleProgress.findFirst({
    where: { title: subModule.title, users: { some: { id: userId } } },
  });

  if (existingSubModuleProgress) {
    return txn.subModuleProgress.update({
      where: { id: existingSubModuleProgress.id },
      data: {
        moduleProgressId,
        order: subModuleIndex + 1,
      },
    });
  } else {
    return txn.subModuleProgress.create({
      data: {
        title: subModule.title,
        slug: slugify(subModule.title, { lower: true }),
        order: subModuleIndex + 1,
        users: { connect: { id: userId } },
        moduleProgress: { connect: { id: moduleProgressId } },
        test: {
          create: {
            title: `${subModule.title} test`,
            users: { connect: { id: userId } },
          },
        },
        checkpoint: {
          create: {
            title: `${subModule.title} checkpoint`,
            gradingMethod: subModule?.gradingMethod,
            users: { connect: { id: userId } },
          },
        },
      },
    });
  }
}

/**
 * Create lesson progresses
 * @param {Prisma.TransactionClient} txn - The transaction client
 * @param {Lesson[]} lessons - The lessons
 * @param {SubModuleProgress} subModuleProgress - The sub module progress
 * @param {String} userId - The user ID
 * @returns {Promise<void>}
 */
async function createLessonProgresses(
  txn: Prisma.TransactionClient,
  lessons: Lesson[],
  subModuleProgress: SubModuleProgress,
  userId: string
): Promise<void> {
  for (const [lessonIndex, lesson] of lessons.entries()) {
    const existingLessonProgress = await txn.lessonProgress.findFirst({
      where: { title: lesson.title, users: { some: { id: userId } } },
    });

    if (existingLessonProgress) {
      await txn.lessonProgress.update({
        where: { id: existingLessonProgress.id },
        data: {
          subModuleProgressId: subModuleProgress.id,
          order: lessonIndex + 1,
        },
      });
    } else {
      await txn.lessonProgress.create({
        data: {
          title: lesson.title,
          slug: slugify(lesson.title, { lower: true }),
          order: lessonIndex + 1,
          users: { connect: { id: userId } },
          subModuleProgress: { connect: { id: subModuleProgress.id } },
        },
      });
    }
  }
}

/**
 * Create badges
 * @param {Prisma.TransactionClient} txn - The transaction client
 * @param {ModuleProgress} moduleProgress - The module progress
 * @param {String} userId - The user ID
 * @returns {Promise<void>}
 */
async function createBadges(
  txn: Prisma.TransactionClient,
  moduleProgress: ModuleProgress,
  userId: string
): Promise<void> {
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
