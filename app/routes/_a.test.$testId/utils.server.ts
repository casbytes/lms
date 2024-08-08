import invariant from "tiny-invariant";
import schedule from "node-schedule";
import { Params, redirect } from "@remix-run/react";
import { getUser, getUserId } from "~/utils/session.server";
import { prisma, Test, User } from "~/utils/db.server";
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
// Server utils
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
      return { test, testQuestions: cache.get(cacheKey) as Question[] };
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
  const { userId, score, intent, testId, moduleId, subModuleId, redirectUrl } =
    await getFormData(request);
  invariant(intent, "Invalid intent");
  const user = await getUser(request);

  try {
    const existingTest = await findExistingTest(
      userId,
      testId,
      moduleId,
      subModuleId
    );
    if (!existingTest) throw new Error("Existing test not found.");
    const nextAttemptAt = calculateNextAttempt(existingTest, score);

    const updateData: {
      score: number;
      status: string;
      attempted: boolean;
      attempts: { increment: number };
      nextAttemptAt?: Date | null;
      users: { connect: { id: string } };
      moduleId?: string | null;
      subModuleId?: string | null;
    } = {
      score,
      status:
        score < CUT_OFF_SCORE ? TEST_STATUS.LOCKED : TEST_STATUS.COMPLETED,
      attempted: true,
      attempts: { increment: 1 },
      nextAttemptAt,
      users: { connect: { id: userId } },
      moduleId: moduleId === "null" ? null : moduleId ?? existingTest.moduleId,
      subModuleId:
        subModuleId === "null" ? null : subModuleId ?? existingTest.subModuleId,
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

      if (checkpointId) {
        await updateCheckpointStatus(checkpointId, userId);
      } else {
        await updateNextModuleOrSubmodule(
          testResponse,
          moduleId,
          subModuleId,
          user
        );
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
    moduleId: formData.get("moduleId") as string | null,
    subModuleId: formData.get("subModuleId") as string | null,
    redirectUrl: formData.get("redirectUrl") as string,
  };
}

async function findExistingTest(
  userId: string,
  testId: string,
  moduleId: string | null,
  subModuleId: string | null
) {
  return prisma.test.findFirst({
    where: {
      id: testId,
      users: { some: { id: userId } },
      OR: [
        { moduleId: { equals: moduleId } },
        { subModuleId: { equals: subModuleId } },
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

async function updateNextModuleOrSubmodule(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  testResponse: any,
  moduleId: string | null,
  subModuleId: string | null,
  user: User
) {
  try {
    if (moduleId) {
      const module = await prisma.module.findUnique({
        where: { id: moduleId },
      });
      if (!module) return;

      const nextModule = await prisma.module.findFirst({
        where: { order: { equals: module.order + 1 } },
      });

      if (nextModule) {
        await prisma.module.update({
          where: { id: nextModule.id },
          data: { status: STATUS.IN_PROGRESS },
        });
      } else if (user.subscribed) {
        await updateCourseProject(moduleId);
      }
    } else if (subModuleId) {
      const subModule = await prisma.subModule.findUnique({
        where: { id: subModuleId },
      });
      if (!subModule) return;
      const nextSubmodule = await prisma.subModule.findFirst({
        where: { order: { equals: subModule.order + 1 } },
      });

      if (nextSubmodule) {
        await prisma.subModule.update({
          where: { id: nextSubmodule.id },
          data: { status: STATUS.IN_PROGRESS },
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

async function updateCourseProject(moduleId: string) {
  try {
    const course = await prisma.course.findFirst({
      where: { modules: { some: { id: moduleId } } },
      include: { project: true },
    });

    if (!course?.project) throw new Error("Project not found.");
    await prisma.project.update({
      where: { id: course.project.id },
      data: { status: STATUS.IN_PROGRESS },
    });
  } catch (error) {
    throw error;
  }
}
