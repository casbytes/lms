import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { STATUS, TEST_STATUS } from "./helpers";
import { prisma } from "./db.server";

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
 * @param host - Host for the X-Forwarded-For header
 * @param testEnvironment - Test environment identifier
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
}): Promise<ApiResponse> {
  try {
    const host = request.headers.get("X-Forwarded-For") as string;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": host,
        "X-Test-Env": testEnvironment,
      },
    });

    if (!response.ok) {
      const errorMessage = `Failed to grade checkpoint. Status: ${response.status} - ${response.statusText}`;
      return formatResponse({
        error: errorMessage,
      });
    }

    const data: ApiResponse = await response.json();
    return formatResponse(data);
  } catch (error) {
    throw error;
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
export function formatResponse({
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
    await prisma.$transaction(async (prisma) => {
      //Get the module
      const module = await prisma.module.findUniqueOrThrow({
        where: { id: moduleId, users: { some: { id: userId } } },
        select: { id: true, order: true },
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

      //Find the next module
      if (user.subscribed) {
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
      }
    });
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
    await prisma.$transaction(async (prisma) => {
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

      // Mark the current submodule as completed
      await prisma.subModule.update({
        where: { id: subModule.id, users: { some: { id: userId } } },
        data: { status: STATUS.COMPLETED },
      });

      // Find the next submodule in the sequence

      if (user.subscribed) {
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
      }
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
