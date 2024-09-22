import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { STATUS } from "./helpers";
import { Course, Module, prisma } from "./db.server";
import { ApiResponse } from "./rtr.server";

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
 * Construct the user's full name
 * @param name - user's name
 * @returns {Record<string, string>} - user's first and last name
 */
export function constructUsername(name: string) {
  const nameParts = name.split(" ");
  const firstName = nameParts[0] || name;
  const lastName = nameParts.slice(1).join(" ") || name;
  return { firstName, lastName };
}

/**
 * Format response
 */
export function formatResponse(success: boolean, message: string) {
  return { success, message };
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
 * Update user subscription status
 * @param paystackCustomerCode - Paystack customer code
 * @param subscribed - Subscription status
 */
export async function updateUserSubscription(
  paystackCustomerCode: string,
  subscribed: boolean
) {
  try {
    return await prisma.user.update({
      where: { paystackCustomerCode },
      data: { subscribed },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Update user progress based on the subscription status
 * @param paystackCustomerCode - Paystack customer code
 */
export async function updateUserProgress(paystackCustomerCode: string) {
  try {
    const { id: userId } = await prisma.user.findUniqueOrThrow({
      where: { paystackCustomerCode },
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

type ClientOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
  signal?: AbortSignal;
};

/**
 * Custom fetch function
 * @param {string} url - The URL to fetch
 * @param {FetchOptions} options - The fetch options
 * @returns {Promise<FetchResponse>}
 */
export async function client<T>(
  url: string,
  options: ClientOptions = {}
): Promise<T> {
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
      throw new Error(errorMessage);
    }

    const data: T = await response.json();
    return data;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    throw new Error(message);
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

        if (completedPercentage >= 50) {
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    throw error;
  }
}

/**
 * Add a user's review to a course or module
 * @param request - Request object
 * @returns {Promise<void>}
 */
export async function addReview(formData: FormData, userId: string) {
  const itemTitle = formData.get("itemTitle") as string;
  const itemType = formData.get("itemType") as string;
  const rating = Number(formData.get("rating"));
  const description = formData.get("description") as string;

  try {
    let courseOrModule: Course | Module;
    if (itemType === "course") {
      courseOrModule = await prisma.course.findFirstOrThrow({
        where: { title: itemTitle },
      });
    } else {
      courseOrModule = await prisma.module.findFirstOrThrow({
        where: { title: itemTitle },
      });
    }

    const moduleOrSubmoduleId = courseOrModule.id;
    const moduleId = itemType === "module" ? moduleOrSubmoduleId : undefined;
    const courseId = itemType === "course" ? moduleOrSubmoduleId : undefined;

    await prisma.reviews.create({
      data: {
        rating,
        description,
        ...(moduleId && { module: { connect: { id: moduleId } } }),
        ...(courseId && { course: { connect: { id: courseId } } }),
        user: { connect: { id: userId } },
      },
    });

    return { success: true, message: "Review added successfully" };
  } catch (error) {
    return { error: true, message: "An error occurred while adding review" };
  }
}
