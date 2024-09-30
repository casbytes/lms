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
 * Reads the content of a page file
 * @param {string} pagePath - The path to the page file within the 'content/pages' directory
 * @returns {Promise<string>} - A promise that resolves to the content of the page file
 * @throws {Error} - If there's an issue reading the file
 * 
 * @example
 * const content = await readPage("home");
 * content will be the content of the home page
 * 
 * @example
 * const content = await readPage("about");
 * content will be the content of the about page
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
 * Reads the content of files in a specified folder
 * @param {string} folder - The name of the folder within the 'content' directory
 * @returns {Array<{data: Record<string, any>, content: string}>} An array of objects, each containing:
 *   - data: An object with the front matter data from the file
 *   - content: The main content of the file as a string
 * 
 * @example
 * const content = readContent("pages");
 * content will be an array of objects with a data property and a content property
 * 
 * @example
 * const content = readContent("faqs");
 * content will be an array of objects with a data property and a content property
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
 * Construct a username from a full name
 * @param {string} name - The full name of the user
 * @returns {{firstName: string, lastName: string}} - The constructed username
 * 
 * @example
 * const username = constructUsername("John Doe");
 * username will be an object with a firstName property and a lastName property
 * 
 * @example
 * const username = constructUsername("John");
 * username will be an object with a firstName property and a lastName property of an empty string
 */
export function constructUsername(name: string) {
  const nameParts = name.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
  return { firstName, lastName };
}


/**
 * Format a response object
 * @param {boolean} success - Indicates if the operation was successful
 * @param {string} message - The message to be returned
 * @returns {success: boolean, message: string} - The formatted response object
 * 
 * @example
 * const response = formatResponse(true, "Operation successful");
 * response will be an object with a success property and a message property
 * 
 * @example
 * const response = formatResponse(false, "Operation failed");
 * response will be an object with a success property and a message property
 */
export function formatResponse(success: boolean, message: string) {
  return { success, message };
}

/**
 * Compute the score of a checkpoint
 * @param response - response from the auto grading
 * @returns {Promise<{totalLintsScore: number, totalTestsScore: number, totalScore: number}>}
 * 
 * @example
 * const score = await computeScore(response);
 * score will be an object with a totalLintsScore property, a totalTestsScore property, and a totalScore property
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
 * Update user subscription status in the database
 * @param stripeCustomerId - The Stripe customer ID of the user
 * @param subscribed - Boolean indicating whether the user is subscribed or not
 * @returns {Promise<User>} - A promise that resolves to the updated User object
 * @throws {Error} - If there's an error updating the user subscription
 * 
 * @example
 * await updateUserSubscription(stripeCustomerId, true);
 * The user subscription status will be updated to true
 * 
 * @example
 * await updateUserSubscription(stripeCustomerId, false);
 * The user subscription status will be updated to false
 * and the subscriptionId will be set to null
 */
export async function updateUserSubscription(
  stripeCustomerId: string,
  subscribed: boolean
) {
  try {
    const data = subscribed
      ? { subscribed }
      : { subscribed, subscriptionId: null };

    return await prisma.user.update({
      where: { stripeCustomerId },
      data,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Update the progress of a user
 * @param {string} stripeCustomerId - The Stripe customer ID of the user
 * @returns {Promise<void>} - A promise that resolves when the user progress is updated
 * @throws {Error} - If there's an error updating the user progress
 * 
 * @example
 * await updateUserProgress(stripeCustomerId);
 * The user progress will be updated to the next available submodule, module, or project
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
 * Get the current course or module in progress for a user
 * @param {string} userId - The ID of the user
 * @returns {Promise<{ title: string } | null>} - A promise that resolves to the current course or module, or null if not found
 * @throws {Error} - If there's an error getting the current course or module
 * 
 * @example
 * const course = await getCurrentCourseOrModule(userId);
 * course will be an object with a title property
 * 
 * @example
 * const module = await getCurrentCourseOrModule(userId);
 * module will be an object with a title property
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

/**
 * Check if a course or module exists in the database
 * @param {string} courseTitle - The title of the course (optional)
 * @param {string} moduleTitle - The title of the module (optional)
 * @returns {Promise<Course | Module | null>} - A promise that resolves to the existing course or module, or null if not found
 * @throws {Error} - If there's an error checking the catalog
 * 
 * @example
 * const course = await checkCatalog({ courseTitle: "Data Structures and Algorithms" });
 * course will be an object with a title property
 * 
 * @example
 * const module = await checkCatalog({ moduleTitle: "CSS" });
 * module will be an object with a title property
 */
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
 * Fetch data from a given URL
 * @param {string} url - The URL to fetch data from
 * @param {ClientOptions} options - Options for the fetch request
 * @returns {Promise<T>} - A promise that resolves to the fetched data
 * @throws {Error} - If there's an error fetching the data
 * 
 * @example
 * const data = await client<{name: string, age: number}>(url, { method: "POST", body: { name: "John", age: 20 } });
 * data will be an object with a name property and an age property
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
      const errorMessage = `Error fetching resource: ${response.status} ${response.statusText}`;
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

/**
 * Check if a course or module has been reviewed by the user
 * @param {string} userId - The ID of the user
 * @param {string} courseId - The ID of the course (optional)
 * @param {string} moduleId - The ID of the module (optional)
 * @returns {Promise<boolean>} - A promise that resolves to true if the course or module has been reviewed, false otherwise
 * @throws {Error} - If there's an error checking the review status
 * 
 * @example
 * const isReviewed = await isCourseOrModuleReviewed(userId, courseId);
 * isReviewed will be a boolean
 * 
 * @example
 * const isReviewed = await isCourseOrModuleReviewed(userId, moduleId);
 * isReviewed will be a boolean
 */
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
 * Add a review to a course or module
 * @param {FormData} formData - The form data containing review details
 * @param {string} userId - The ID of the user adding the review
 * @returns {Promise<{success: boolean, message: string}>} - A promise that resolves to the review status
 * @throws {Error} - If there's an error adding the review
 *  
 * @example
 * const review = await addReview(formData, userId);
 * review will be an object with a success property and a message property
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
