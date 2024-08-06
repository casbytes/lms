/* eslint-disable no-undefined */
import invariant from "tiny-invariant";
import slugify from "slugify";
import {
  prisma,
  type Course,
  type Module,
  type Prisma,
  type SubModule,
} from "~/utils/db.server";
import { getUserId } from "~/utils/session.server";
import { octokit } from "~/utils/octokit.server";
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

export interface GithubCourse {
  title: string;
  id: string;
  published: boolean;
  testEnvironment?: "node" | "browser";
  modules: GithubModule[];
}
export interface GithubModule {
  title: string;
  id: string;
  checkpoint?: boolean;
  testEnvironment?: "node" | "browser";
  subModules: GithubSubModule[];
}
export interface GithubSubModule {
  title: string;
  id: string;
  checkpoint?: boolean;
  testEnvironment?: "node" | "browser";
  lessons: GithubLesson[];
}
export interface GithubLesson {
  title: string;
  id: string;
}

const date = new Date();
const today = startOfDay(date);

interface TimeRange {
  start: Date;
  end: Date;
}

function generateDateRanges(
  unit: "days" | "weeks" | "months",
  length: number
): TimeRange[] {
  const ranges: TimeRange[] = [];
  for (let i = 0; i < length; i++) {
    let start: Date;
    let end: Date;

    switch (unit) {
      case "days":
        start = subDays(today, i);
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

async function getLearningData(
  request: Request,
  unit: "days" | "weeks" | "months",
  length: number
): Promise<{ date: string; hours: number }[]> {
  try {
    const userId = await getUserId(request);
    const ranges = generateDateRanges(unit, length);

    let dateCondition: Date;
    switch (unit) {
      case "days":
        dateCondition = subDays(today, 7);
        break;
      case "weeks":
        dateCondition = subWeeks(startOfWeek(today), 7);
        break;
      case "months":
        dateCondition = subMonths(startOfMonth(today), 6);
        break;
    }

    const learningTimes = await prisma.learningTime.findMany({
      where: {
        userId,
        date: {
          gte: dateCondition,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return ranges.map(({ start, end }) => {
      const entries = learningTimes.filter(
        (lh) => lh.date >= start && lh.date <= end
      );
      const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
      let formattedDate: string;

      switch (unit) {
        case "days":
          formattedDate = format(start, "MMM d");
          break;
        case "weeks":
          formattedDate = `${format(start, "MMM d")}-${format(end, "MMM d")}`;
          break;
        case "months":
          formattedDate = format(start, "MMM yyyy");
          break;
      }

      return {
        date: formattedDate,
        hours: Number(totalHours.toFixed(2)),
      };
    });
  } catch (error) {
    throw error;
  }
}

export type TimeData = {
  date: string;
  hours: number;
};

export async function getLearningTime(request: Request): Promise<TimeData[]> {
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
        result = await getLearningData(request, "days", 7);
        break;
      case "weeks":
        result = await getLearningData(request, "weeks", 8);
        break;
      case "months":
        result = await getLearningData(request, "months", 6);
        break;
      default:
        result = await getLearningData(request, "days", 7);
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
 * @returns {Promise<ICourse[]>}
 */
export async function getUserCourses(request: Request): Promise<Course[]> {
  try {
    const userId = await getUserId(request);
    const userCourses = await prisma.course.findMany({
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
 * @returns {Promise<ICourse[]>} - The user modules
 */
export async function getUserModules(request: Request): Promise<Module[]> {
  const url = new URL(request.url);
  const search = url.searchParams.get("userModule") ?? "";
  try {
    const userId = await getUserId(request);
    const userModules = await prisma.module.findMany({
      where: {
        OR: [{ title: { contains: search } }],
        users: { some: { id: userId } },
      },
      include: {
        course: true,
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
    prisma.course.findMany({
      where: {
        users: { some: { id: userId } },
        NOT: { status: STATUS.COMPLETED },
      },
    }),
    prisma.module.findMany({
      where: {
        users: { some: { id: userId } },
        NOT: { status: STATUS.COMPLETED },
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

async function getGithubCourses(): Promise<GithubCourse[]> {
  const cacheKey = "github-courses";
  const cachedCourses = cache.get<GithubCourse[]>(cacheKey);
  if (cachedCourses) {
    return cachedCourses;
  }

  try {
    const meta = await getMeta();
    const githubCourses: GithubCourse[] = await Promise.all(
      meta.map(async (folder) => {
        const jsonContent = await getFileContent(folder.path);
        return JSON.parse(jsonContent);
      })
    );

    const uniqueCourses = Array.from(
      new Map(
        githubCourses.filter(Boolean).map((course) => [course.id, course])
      ).values()
    );

    cache.set<GithubCourse[]>(cacheKey, uniqueCourses);
    return uniqueCourses;
  } catch (error) {
    throw error;
  }
}

/**
 * Get courses
 * @param {Request} request - The incoming request
 * @returns {Promise<{ courses: ICourse[], inCatalog: Boolean }>}
 */
export async function getCourses(
  request: Request
): Promise<{ courses: GithubCourse[]; inCatalog: boolean }> {
  try {
    const userId = await getUserId(request);
    const inCatalog = await checkCatalog(userId);
    const courses = await getGithubCourses();
    return { courses, inCatalog };
  } catch (error) {
    throw error;
  }
}

export async function getModules(
  request: Request
): Promise<{ modules: GithubModule[]; inCatalog: boolean }> {
  const url = new URL(request.url);
  const search = url.searchParams.get("module");
  try {
    const { courses, inCatalog } = await getCourses(request);
    const modules = courses.reduce((acc, course) => {
      if (course.modules) {
        acc.push(...course.modules);
      }
      return acc;
    }, [] as GithubModule[]);

    const filteredModules = modules.filter((module) =>
      module.title.toLowerCase().includes(search?.toLowerCase() ?? "")
    );
    return { modules: filteredModules, inCatalog };
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
    await prisma.course.delete({
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
    await prisma.module.delete({
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
  const githubCourses = await getGithubCourses();
  let githubModule: GithubModule | undefined;
  for (const githubCourse of githubCourses) {
    githubModule = githubCourse.modules.find((m) => m.id === String(moduleId));
    if (githubModule) break;
  }
  invariant(githubModule, "Github Module not found.");

  try {
    return await prisma.$transaction(async (txn) => {
      const existingModule = await txn.module.findFirst({
        where: { title: githubModule.title, users: { some: { id: userId } } },
      });

      if (existingModule) {
        return { success: false, message: "Module already in catalog" };
      }

      const module = await txn.module.create({
        data: {
          title: githubModule.title,
          slug: slugify(githubModule.title, { lower: true }),
          users: { connect: { id: userId } },
          status: STATUS.IN_PROGRESS,
          order: 1,
          test: {
            create: {
              title: `${githubModule.title} test`,
              users: { connect: { id: userId } },
            },
          },
          checkpoint: githubModule?.checkpoint
            ? {
                create: {
                  title: `${githubModule.title} checkpoint`,
                  users: { connect: { id: userId } },
                },
              }
            : undefined,
        },
      });

      await Promise.all([
        createSubModules(txn, githubModule.subModules, module, userId),
        createBadges(txn, module, userId),
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
    const githubCourses = await getGithubCourses();
    const githubCourse = githubCourses.find((c) => c.id === String(courseId));
    invariant(githubCourse, "Course not found.");

    return await prisma.$transaction(async (txn) => {
      const existingCourse = await txn.course.findFirst({
        where: { title: githubCourse.title, users: { some: { id: userId } } },
      });
      if (existingCourse) {
        return { success: false, message: "Course already in catalog" };
      }
      const course = await txn.course.create({
        data: {
          title: githubCourse.title,
          slug: slugify(githubCourse.title, { lower: true }),
          users: { connect: { id: userId } },
          project: {
            create: {
              title: `${githubCourse.title} project`,
              testEnvironment: githubCourse?.testEnvironment,
              slug: slugify(githubCourse.title, { lower: true }),
              contributors: { connect: { id: userId } },
            },
          },
        },
      });

      await createModule(txn, githubCourse.modules, course, userId);
      return { success: true, message: "Course added to catalog" };
    });
  } catch (error) {
    return { success: false, message: "Failed to add course to catalog" };
  }
}

/**
 * Create module progresses
 * @param {Prisma.TransactionClient} txn - The transaction client
 * @param {GithubModule[]} githubModules - The modules
 * @param {Course} course - The course progress
 * @param {String} userId - The user ID
 * @returns {Promise<void>}
 */
async function createModule(
  txn: Prisma.TransactionClient,
  githubModules: GithubModule[],
  course: Course,
  userId: string
): Promise<void> {
  try {
    for (const [moduleIndex, githubModule] of githubModules.entries()) {
      const module = await upsertModule(
        txn,
        githubModule,
        moduleIndex,
        course.id,
        userId
      );
      await createSubModules(txn, githubModule.subModules, module, userId);
      await createBadges(txn, module, userId);
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Upsert module progress
 * @param {Prisma.TransactionClient} txn - The transaction client
 * @param {GithubModule} githubModule - The module
 * @param {number} moduleIndex - The module index
 * @param {string} courseId - The course progress ID
 * @param {string} userId - The user ID
 * @returns {Promise}
 */
async function upsertModule(
  txn: Prisma.TransactionClient,
  githubModule: GithubModule,
  moduleIndex: number,
  courseId: string,
  userId: string
) {
  try {
    const existingModule = await txn.module.findFirst({
      where: { title: githubModule.title, users: { some: { id: userId } } },
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
          title: githubModule.title,
          slug: slugify(githubModule.title, { lower: true }),
          premium: moduleIndex !== 0,
          order: moduleIndex + 1,
          users: { connect: { id: userId } },
          course: { connect: { id: courseId } },
          test: {
            create: {
              title: `${githubModule.title} test`,
              users: { connect: { id: userId } },
            },
          },
          checkpoint: githubModule?.checkpoint
            ? {
                create: {
                  title: `${githubModule.title} checkpoint`,
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
 * @param {GithubModule[]} githubSubModules - The sub modules
 * @param {Module} module - The module progress
 * @param {String} userId - The user ID
 * @returns {Promise<void>}
 */
async function createSubModules(
  txn: Prisma.TransactionClient,
  githubSubModules: GithubSubModule[],
  module: Module,
  userId: string
) {
  try {
    for (const [
      subModuleIndex,
      githubSubModule,
    ] of githubSubModules.entries()) {
      const subModule = await upsertSubModule(
        txn,
        githubSubModule,
        subModuleIndex,
        module.id,
        userId
      );
      await createLessons(txn, githubSubModule.lessons, subModule, userId);
      return subModule;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Upsert sub module progress
 * @param {Prisma.TransactionClient} txn - The transaction client
 * @param {GithubSubModule} githubSubModule - The sub module
 * @param {number} subModuleIndex - The sub module index
 * @param {string} moduleId - The module progress ID
 * @param {string} userId - The user ID
 * @returns {Promise<SubModule>}
 */
async function upsertSubModule(
  txn: Prisma.TransactionClient,
  githubSubModule: GithubSubModule,
  subModuleIndex: number,
  moduleId: string,
  userId: string
) {
  const existingSubModule = await txn.subModule.findFirst({
    where: { title: githubSubModule.title, users: { some: { id: userId } } },
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
        title: githubSubModule.title,
        slug: slugify(githubSubModule.title, { lower: true }),
        order: subModuleIndex + 1,
        users: { connect: { id: userId } },
        module: { connect: { id: moduleId } },
        test: {
          create: {
            title: `${githubSubModule.title} test`,
            users: { connect: { id: userId } },
          },
        },
        checkpoint: githubSubModule?.checkpoint
          ? {
              create: {
                title: `${githubSubModule.title} checkpoint`,
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
 * @param {GithubLesson[]} githubLessons - The lessons
 * @param {SubModule} subModule - The sub module progress
 * @param {String} userId - The user ID
 * @returns {Promise<void>}
 */
async function createLessons(
  txn: Prisma.TransactionClient,
  githubLessons: GithubLesson[],
  subModule: SubModule,
  userId: string
): Promise<void> {
  for (const [lessonIndex, githubLesson] of githubLessons.entries()) {
    const existingLesson = await txn.lesson.findFirst({
      where: { title: githubLesson.title, users: { some: { id: userId } } },
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
          title: githubLesson.title,
          slug: slugify(githubLesson.title, { lower: true }),
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
