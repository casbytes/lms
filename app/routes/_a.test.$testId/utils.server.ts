import invariant from "tiny-invariant";
import schedule from "node-schedule";
import { Params, redirect } from "@remix-run/react";
import { getUserId } from "~/utils/session.server";
import { prisma, Test } from "~/utils/db.server";
import { STATUS, TEST_STATUS } from "~/utils/helpers";
import { getContentFromGithub } from "~/utils/octokit.server";
import { cache } from "~/utils/node-cache.server";

export interface Option {
  id: number;
  text: string;
}

export interface Question {
  id: number;
  isMultiple?: boolean;
  question: string;
  options: Option[];
  correctAnswer: number[]; // Contains IDs of correct options
}

//################
// Loader utils
//################
/**
 * Get a test
 * @param request - The incoming request
 * @param params - The incoming params
 * @returns {Promise<Test>}
 */
export async function getTest(request: Request, params: Params<string>) {
  const url = new URL(request.url).searchParams;
  const userId = await getUserId(request);
  const moduleOrSubmoduleId = url.get("moduleId") ?? url.get("submoduleId");
  invariant(
    moduleOrSubmoduleId,
    "module or submoduleId is required to get Test"
  );
  const testId = params.testId;
  invariant(testId, "Test ID is required to get Test");

  try {
    const test = await getTestById(testId, moduleOrSubmoduleId, userId);
    if (!test) {
      throw new Error("Test not found.");
    }
    if (test?.nextAttemptAt) {
      await scheduleStatusUpdate(testId, test.nextAttemptAt);
    }

    const repo =
      test?.module?.slug ?? (test?.subModule?.module?.slug as string);

    const path = test?.module
      ? "test.json"
      : `${test?.subModule?.slug}/test.json`;

    const cacheKey = `test-${test.id}`;
    if (cache.has(cacheKey)) {
      const testQuestions = cache.get(cacheKey) as Question[];
      return { test, testQuestions };
    }
    const { content } = await getContentFromGithub({
      repo,
      path,
    });
    const testQuestions = JSON.parse(content) as Question[];
    cache.set<Question[]>(cacheKey, testQuestions);
    return { test, testQuestions };
  } catch (error) {
    throw error;
  }
}

/**
 * Get a test by its ID
 * @param {String} testId - The test ID
 * @param {String} id - The module or sub module ID
 * @param {String} userId - The user ID
 * @returns {Promise<Test>}
 */
async function getTestById(
  testId: string,
  moduleOrSubmoduleId: string,
  userId: string
) {
  return prisma.test.findFirst({
    where: {
      id: testId,
      OR: [
        { moduleId: { equals: moduleOrSubmoduleId } },
        { subModuleId: { equals: moduleOrSubmoduleId } },
      ],
      users: { some: { id: userId } },
    },
    include: {
      module: true,
      subModule: {
        include: {
          module: true,
        },
      },
    },
  });
}

/**
 *  Schedule a status update for a test
 * @param {String} testId - The test id
 * @param {Date} nextAttemptAt - The date to update the test status
 * @returns {Promise<void>}
 */
async function scheduleStatusUpdate(testId: string, nextAttemptAt: Date) {
  if (!nextAttemptAt) return;
  schedule.scheduleJob(nextAttemptAt, async () => {
    try {
      await prisma.test.update({
        where: { id: testId },
        data: { status: TEST_STATUS.AVAILABLE as TEST_STATUS },
      });
    } catch (error) {
      throw error;
    }
  });
}

//################
// Action uitls
//################
const CUT_OFF_SCORE = 80;
/**
 * Update a test
 * @param request - The incoming request
 * @returns {Promise<any>}
 */
export async function updateTest(request: Request) {
  // itemId can be moduleId or subModuleId
  const { userId, score, intent, testId, itemId, redirectUrl } =
    await getFormData(request);
  invariant(intent === "submit", "Invalid intent");
  invariant(itemId, "Item ID is required to update test");

  try {
    const existingTest = await findExistingTest(userId, testId, itemId);
    if (!existingTest) throw new Error("Existing test not found.");
    const nextAttemptAt = calculateNextAttempt(existingTest, score);

    const updateData: {
      score: number;
      status: string;
      attempted: boolean;
      attempts: { increment: number };
      nextAttemptAt?: Date | null;
      users: { connect: { id: string } };
      moduleId: string | null;
      subModuleId: string | null;
    } = {
      score,
      status:
        score < CUT_OFF_SCORE ? TEST_STATUS.LOCKED : TEST_STATUS.COMPLETED,
      attempted: true,
      attempts: { increment: 1 },
      nextAttemptAt,
      users: { connect: { id: userId } },
      moduleId: existingTest.moduleId ?? null,
      subModuleId: existingTest.subModuleId ?? null,
    };

    const testResponse = await updateTestStatus(testId, updateData);
    if (!testResponse) {
      throw new Error("Failed to update test.");
    }

    if (
      testResponse.score >= CUT_OFF_SCORE &&
      testResponse.status === TEST_STATUS.COMPLETED
    ) {
      const checkpointId =
        testResponse.module?.checkpoint?.id ??
        testResponse.subModule?.checkpoint?.id ??
        null;

      const moduleId = testResponse.moduleId ?? null;
      const subModuleId = testResponse.subModuleId ?? null;

      if (checkpointId) {
        await updateCheckpointStatus(checkpointId, userId);
      } else if (moduleId !== null) {
        await updateStatusAndFindNextModule(moduleId, userId);
      } else {
        await updateStatusAndFindNextSubmodule(subModuleId!, userId);
      }
    }
    return redirect(redirectUrl);
  } catch (error) {
    throw error;
  }
}

/**
 *
 * @param request - request
 * @returns {Record<string, any>}
 */
async function getFormData(request: Request) {
  const formData = await request.formData();
  return {
    userId: await getUserId(request),
    score: Number(formData.get("score")),
    intent: String(formData.get("intent")),
    testId: String(formData.get("testId")),
    itemId: formData.get("itemId") as string | null,
    redirectUrl: formData.get("redirectUrl") as string,
  };
}

async function findExistingTest(
  userId: string,
  testId: string,
  itemId: string
) {
  return prisma.test.findFirst({
    where: {
      id: testId,
      users: { some: { id: userId } },
      OR: [
        { moduleId: { equals: itemId } },
        { subModuleId: { equals: itemId } },
      ],
    },
  });
}

function calculateNextAttempt(existingTest: Test, score: number) {
  const now = new Date();
  const attemptIncrement = 24 * 60 * 60 * 1000; // 1 day in milliseconds
  const daysUntilNextAttempt =
    (existingTest?.attempts === 0 ? 1 : existingTest.attempts + 1) *
    attemptIncrement;
  const nextAttemptTime = new Date(now.getTime() + daysUntilNextAttempt);

  if (existingTest?.nextAttemptAt) {
    return score >= CUT_OFF_SCORE ? null : nextAttemptTime;
  } else {
    return score < CUT_OFF_SCORE ? nextAttemptTime : null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateTestStatus(testId: string, updateData: any) {
  return prisma.test.update({
    where: { id: testId },
    data: updateData,
    include: {
      module: { include: { checkpoint: true } },
      subModule: { include: { checkpoint: true } },
    },
  });
}

async function updateStatusAndFindNextModule(moduleId: string, userId: string) {
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
  const nextModule = await prisma.module.findFirst({
    where: {
      order: { equals: module.order + 1 },
      users: { some: { id: userId } },
    },
    select: { id: true },
  });

  if (user.subscribed) {
    if (nextModule) {
      await prisma.module.update({
        where: { id: nextModule.id, users: { some: { id: userId } } },
        data: { status: STATUS.IN_PROGRESS },
      });
    } else {
      await updateCourseProject(moduleId, userId);
    }
  }
}

async function updateStatusAndFindNextSubmodule(
  subModuleId: string,
  userId: string
) {
  try {
    // Fetch the submodule along with its parent module
    const subModule = await prisma.subModule.findUniqueOrThrow({
      where: { id: subModuleId, users: { some: { id: userId } } },
      include: { module: true },
    });

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { subscribed: true },
    });

    // Mark the current submodule as completed
    await prisma.subModule.update({
      where: { id: subModule.id, users: { some: { id: userId } } },
      data: { status: STATUS.COMPLETED },
    });

    // Find the next submodule in the sequence
    const nextSubmodule = await prisma.subModule.findFirst({
      where: {
        moduleId: subModule.module.id,
        order: { equals: subModule.order + 1 },
        users: { some: { id: userId } },
      },
      select: { id: true },
    });

    if (user.subscribed) {
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
  } catch (error) {
    throw error;
  }
}

async function updateCheckpointStatus(checkpointId: string, userId: string) {
  return prisma.checkpoint.update({
    where: { id: checkpointId, users: { some: { id: userId } } },
    data: { status: STATUS.IN_PROGRESS },
  });
}

async function updateCourseProject(moduleId: string, userId: string) {
  try {
    const course = await prisma.course.findFirst({
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
