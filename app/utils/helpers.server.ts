import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { STATUS, TEST_STATUS } from "./helpers";
import { Course, Module, Prisma, prisma, SubModule } from "./db.server";
import { MetaLesson, MetaModule, MetaSubModule } from "~/services/sanity/types";
import {
  getMetaCourseById,
  getMetaModuleById,
} from "~/services/sanity/index.server";

interface Message {
  ruleId: string;
  severity: number;
  message: string;
  line: number;
  column: number;
  nodeType: string;
  messageId: string;
  endLine: number;
  endColumn: number;
}

export interface LintResult {
  filePath: string;
  messages: Message[] | [];
  suppressedMessages: unknown[];
  errorCount: number;
  fatalErrorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
  source: string;
  usedDeprecatedRules: unknown[];
}

interface AssertionResult {
  ancestorTitles: string[];
  fullName: string;
  status: string;
  title: string;
  duration: number;
  failureMessages: string[];
  meta: Record<string, unknown>;
}

interface TestResultDetail {
  assertionResults: AssertionResult[];
  startTime: number;
  endTime: number;
  status: string;
  message: string;
  name: string;
}

interface Snapshot {
  added: number;
  failure: boolean;
  filesAdded: number;
  filesRemoved: number;
  filesRemovedList: unknown[];
  filesUnmatched: number;
  filesUpdated: number;
  matched: number;
  total: number;
  unchecked: number;
  uncheckedKeysByFile: unknown[];
  unmatched: number;
  updated: number;
  didUpdate: boolean;
}

export interface TestResults {
  numTotalTestSuites: number;
  numPassedTestSuites: number;
  numFailedTestSuites: number;
  numPendingTestSuites: number;
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  numPendingTests: number;
  numTodoTests: number;
  snapshot: Snapshot;
  startTime: number;
  success: boolean;
  testResults: TestResultDetail[];
}

export interface ApiResponse {
  lintResults: LintResult[] | null;
  testResults: TestResults | null;
  error: string | null;
}

export const LINT_CUTOFF_SCORE = 30;
export const TEST_CUTOFF_SCORE = 50;
export const TOTAL_CUTOFF_SCORE = LINT_CUTOFF_SCORE + TEST_CUTOFF_SCORE;

/**
 * Reads the content of file from the path
 * @param path - string
 * @returns {Promise<string>}
 */
export function readPage(pagePath: string): Promise<string> {
  const filePath = path.join(process.cwd(), "content/pages", pagePath);
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}

/**
 * Reads the content of folder
 * @param folder - string
 * @returns {Array<{data: Record<string, string>, content: string}>}
 */
export function readContent(folder: string) {
  const dir = path.join(process.cwd(), `content/${folder}`);
  const files = fs.readdirSync(dir);
  return files
    .map((file) => {
      const fileContent = fs.readFileSync(path.join(dir, file), "utf-8");
      const { data, content } = matter(fileContent);
      return { data, content };
    })
    .filter(Boolean);
}

/**
 * Get video source
 * @returns {string} - video source
 */

export function getVideoSource() {
  const { IFRAME_URL: iframeUrl, VIDEO_LIBRARY_ID: libraryId } =
    process.env as Record<string, string>;
  return `${iframeUrl}/embed/${Number(libraryId)}`;
}

/**
 * Fetch the checkpoint and grade it
 * @param url - URL to send the POST request to
 * @param testEnvironment - Test environment identifier
 * @param request - The original Request object containing the host and body
 * @returns {Promise<ApiResponse>} - The API response, formatted as needed
 */
export async function gradeFetch({
  url,
  testEnvironment,
  request,
}: {
  url: string;
  testEnvironment: string;
  request: Request;
}) {
  try {
    const host = request.headers.get("X-Forwarded-For") as string;

    const headers = {
      "Content-Type": "application/json",
      "X-Forwarded-For": host,
      "X-Test-Env": testEnvironment,
    };

    const { data, error } = await customFetch<ApiResponse>(url, {
      method: "POST",
      headers,
    });

    if (error) {
      throw new Error(error);
    }

    return formatCheckerResponse(data!);
  } catch (error) {
    const errorMessage = `Failed to grade checkpoint. Error: ${
      error instanceof Error ? error.message : "Unknown error"
    }`;
    return formatCheckerResponse({ error: errorMessage });
  }
}

/**
 * Compute the score of a checkpoint
 * @param response - response from the auto grading
 * @param checkpointId - checkpoint id
 * @param userId - user id
 * @returns {Promise<Checkpoint>}
 */
export async function computeScore(response: ApiResponse) {
  // Lints
  let lintScore = 0;
  let lintFiles = 0;
  response.lintResults?.forEach((lintResult) => {
    lintFiles++;
    if (!lintResult.errorCount || !lintResult.fatalErrorCount) {
      lintScore++;
    }
  });

  //Tests
  let passedTestsCount = 0;
  let totalTestsCount = 0;

  if (response.testResults) {
    const { testResults } = response;
    passedTestsCount = testResults.numPassedTests;
    totalTestsCount = testResults.numTotalTests;
  }

  const totalLintsScore =
    lintFiles > 0 ? (lintScore / lintFiles) * LINT_CUTOFF_SCORE : 0;
  const totalTestsScore =
    totalTestsCount > 0
      ? (passedTestsCount / totalTestsCount) * TEST_CUTOFF_SCORE
      : 0;
  const totalScore =
    ((totalLintsScore + totalTestsScore) / TOTAL_CUTOFF_SCORE) * 100;

  return {
    totalLintsScore,
    totalTestsScore,
    totalScore,
  };
}

/**
 * Get the request URL
 * @param userGithubUsername - user's github username
 * @param checkpointPath - checkpoint path
 * @param checkpointRepo - checkpoint repo
 * @returns {string} - request URL
 */
export function getRequestUrl({
  username,
  path,
  repo,
}: {
  username: string;
  path: string;
  repo: string;
}) {
  const baseUrl = process.env.CHECKER_URL as string;
  return `${baseUrl}/${username}?path=${path}&repo=${repo}`;
}

/**
 * Format the response
 * @param error - error message
 * @param message - message
 * @param lintReulsts - lint results
 * @param testResults - test results
 * @returns {ApiResponse}
 */
export function formatCheckerResponse({
  error = null,
  lintResults = null,
  testResults = null,
}: {
  error?: string | null;
  lintResults?: LintResult[] | null;
  testResults?: TestResults | null;
}) {
  return { error, lintResults, testResults };
}

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
          await updateCourseProject(moduleId, userId);
        }
      });
    }
  } catch (error) {
    throw error;
  }
}

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
 * Update the submodule score
 * @param subModuleId - Submodule ID
 * @param userId - User ID
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
 * Update project status based on the computed scores.
 * @param moduleId -  Module ID
 * @param userId - User ID
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
 * Update user subscription status
 * @param stripeCustomerId - Stripe customer ID
 * @param subscribed - Subscription status
 */
export async function updateUserSubscription(
  stripeCustomerId: string,
  subscribed: boolean
) {
  try {
    return await prisma.user.update({
      where: { stripeCustomerId },
      data: {
        subscribed,
      },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Update user progress based on the subscription status
 * @param stripeCustomerId - Stripe customer ID
 */
export async function updateUserProgress(stripeCustomerId: string) {
  try {
    const { id: userId } = await prisma.user.findUniqueOrThrow({
      where: { stripeCustomerId },
      select: { id: true },
    });

    const lockedSubmodule = await prisma.subModule.findFirst({
      where: { status: STATUS.LOCKED, users: { some: { id: userId } } },
      select: { id: true },
      orderBy: { order: "asc" },
    });

    if (lockedSubmodule) {
      await prisma.subModule.update({
        where: { id: lockedSubmodule.id },
        data: { status: STATUS.IN_PROGRESS },
      });
      return;
    }

    const lockedModule = await prisma.module.findFirst({
      where: { status: STATUS.LOCKED, users: { some: { id: userId } } },
      select: { id: true },
      orderBy: { order: "asc" },
    });

    if (lockedModule) {
      await prisma.module.update({
        where: { id: lockedModule.id },
        data: { status: STATUS.IN_PROGRESS },
      });
      return;
    }

    const lockedProject = await prisma.project.findFirst({
      where: { status: STATUS.LOCKED, contributors: { some: { id: userId } } },
      select: { id: true },
    });

    if (lockedProject) {
      await prisma.project.update({
        where: { id: lockedProject.id },
        data: { status: STATUS.IN_PROGRESS },
      });
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Add a module to a user's catalog
 * @param {String} moduleId - The module ID
 * @param {String} userId - The user ID
 * @returns {Promise<void>}
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

      await Promise.all([
        createSubModules(txn, metaModule.subModules, module, userId),
        createBadges(txn, module, userId),
      ]);
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
 * Add a course to a user's catalog
 * @param {String} userId - The user ID
 * @param {String} courseId - The course ID
 * @returns {Promise<void>}
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
export function formatResponse(success: boolean, message: string) {
  return { success, message };
}

/**
 * Check if a user has a course or module in progress
 * @param {String} userId
 * @returns {Promise<Boolean>}
 */
export async function getCurrentCourseOrModule(
  userId: string
): Promise<{ title: string } | null> {
  const currentCourse = await prisma.course.findFirst({
    where: { users: { some: { id: userId } }, status: STATUS.IN_PROGRESS },
    select: { title: true },
  });
  if (currentCourse) {
    return currentCourse;
  }
  const currentModule = await prisma.module.findFirst({
    where: { users: { some: { id: userId } }, status: STATUS.IN_PROGRESS },
    select: { title: true },
  });
  return currentModule;
}

export async function checkCatalog({
  courseTitle,
  moduleTitle,
}: {
  courseTitle?: string;
  moduleTitle?: string;
}) {
  let existingItem = null;
  if (courseTitle) {
    existingItem = await prisma.course.findFirst({
      where: { title: courseTitle },
    });
  } else {
    existingItem = await prisma.module.findFirst({
      where: { title: moduleTitle },
    });
  }
  return existingItem;
}

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
  signal?: AbortSignal;
};

type FetchResponse<T> = {
  data: T | null;
  error: string | null;
};

/**
 * Custom fetch function
 * @param {string} url - The URL to fetch
 * @param {FetchOptions} options - The fetch options
 * @returns {Promise<FetchResponse>}
 */
export async function customFetch<T>(
  url: string,
  options: FetchOptions = {}
): Promise<FetchResponse<T>> {
  const { method = "GET", headers = {}, body, signal } = options;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });

    if (!response.ok) {
      const errorMessage = `Error: ${response.status} ${response.statusText}`;
      return {
        data: null,
        error: errorMessage,
      };
    }

    const data: T = await response.json();
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export async function isCourseOrModuleReviewed({
  userId,
  courseId,
  moduleId,
}: {
  userId: string;
  courseId?: string;
  moduleId?: string;
}): Promise<boolean> {
  try {
    if (courseId) {
      const course = await prisma.course.findFirstOrThrow({
        where: { id: courseId, users: { some: { id: userId } } },
        include: {
          reviews: { where: { userId } },
          modules: {
            select: { id: true, status: true },
          },
        },
      });

      if (course.reviews.length === 0) {
        const completedModules = course.modules.filter(
          (module) => module.status === STATUS.COMPLETED
        ).length;

        const completedPercentage = Math.round(
          (completedModules / course.modules.length) * 100
        );

        if (completedPercentage >= 25) {
          return true;
        }
      }
    }

    if (moduleId) {
      const module = await prisma.module.findFirstOrThrow({
        where: { id: moduleId, users: { some: { id: userId } } },
        include: {
          reviews: { where: { userId } },
          subModules: {
            select: { id: true, status: true },
          },
        },
      });

      if (module.reviews.length === 0) {
        const completedSubModules = module.subModules.filter(
          (subModule) => subModule.status === STATUS.COMPLETED
        ).length;

        const completedPercentage = Math.round(
          (completedSubModules / module.subModules.length) * 100
        );

        if (completedPercentage >= 25) {
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    throw error;
  }
}
