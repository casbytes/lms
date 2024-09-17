import invariant from "tiny-invariant";
import schedule from "node-schedule";
import yaml from "js-yaml";
import { Params, redirect } from "@remix-run/react";
import { getUserId } from "~/utils/session.server";
import { prisma, Test } from "~/utils/db.server";
import { STATUS, TEST_STATUS } from "~/utils/helpers";
import { getContentFromGithub } from "~/utils/octokit.server";
import { Cache } from "~/utils/cache.server";
import {
  updateModuleStatusAndFindNextModule,
  updateSubmoduleStatusAndFindNextSubmodule,
} from "~/utils/module.server";

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
    const test = await getCurrentTest({ testId, moduleOrSubmoduleId, userId });
    if (test?.nextAttemptAt) {
      await scheduleStatusUpdate(testId, test.nextAttemptAt);
    }

    const repo =
      test?.module?.slug ?? (test?.subModule?.module?.slug as string);

    const fileName = "test.yml";
    const path = test?.module
      ? fileName
      : `${test?.subModule?.slug}/${fileName}`;

    const cacheKey = `test-${test.id}`;
    const cachedQuestions = (await Cache.get(cacheKey)) as Question[] | null;
    if (cachedQuestions) {
      return { test, testQuestions: cachedQuestions };
    }
    const { content } = await getContentFromGithub({
      repo,
      path,
    });

    const testQuestions = yaml.load(content) as Question[];
    await Cache.set<Question[]>(cacheKey, testQuestions);
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
async function getCurrentTest({
  testId,
  moduleOrSubmoduleId,
  userId,
}: {
  testId: string;
  moduleOrSubmoduleId: string;
  userId: string;
}) {
  try {
    return prisma.test.findUniqueOrThrow({
      where: {
        id: testId,
        users: { some: { id: userId } },
        OR: [
          { moduleId: { equals: moduleOrSubmoduleId } },
          { subModuleId: { equals: moduleOrSubmoduleId } },
        ],
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
  } catch (error) {
    throw error;
  }
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
        data: { status: TEST_STATUS.AVAILABLE },
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
  const { userId, score, intent, testId, moduleOrSubmoduleId, redirectUrl } =
    await getFormData(request);
  invariant(intent === "submit", "Invalid intent");
  invariant(moduleOrSubmoduleId, "Item ID is required to update test");

  try {
    const test = await getCurrentTest({ testId, moduleOrSubmoduleId, userId });
    const nextAttemptAt = calculateNextAttempt({ test, score });

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
      moduleId: test.moduleId ?? null,
      subModuleId: test.subModuleId ?? null,
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
      // const course = testResponse.module?.courseId ?? null;

      if (checkpointId) {
        await updateCheckpointStatus(checkpointId, userId);
      } else if (moduleId !== null) {
        await updateModuleStatusAndFindNextModule({ moduleId, userId });
      } else {
        await updateSubmoduleStatusAndFindNextSubmodule({
          subModuleId: subModuleId as string,
          userId,
        });
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
    moduleOrSubmoduleId: formData.get("itemId") as string,
    redirectUrl: formData.get("redirectUrl") as string,
  };
}

function calculateNextAttempt({ test, score }: { test: Test; score: number }) {
  const now = new Date();
  const attemptIncrement = 24 * 60 * 60 * 1000; // 1 day in milliseconds
  const daysUntilNextAttempt =
    (test?.attempts === 0 ? 1 : test.attempts + 1) * attemptIncrement;
  const nextAttemptTime = new Date(now.getTime() + daysUntilNextAttempt);

  if (test?.nextAttemptAt) {
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

async function updateCheckpointStatus(checkpointId: string, userId: string) {
  return prisma.checkpoint.update({
    where: { id: checkpointId, users: { some: { id: userId } } },
    data: { status: STATUS.IN_PROGRESS },
  });
}
