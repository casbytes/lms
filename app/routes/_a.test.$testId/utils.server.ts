import invariant from "tiny-invariant";
import schedule from "node-schedule";
import { Params } from "@remix-run/react";
import { getUserId } from "~/utils/session.server";
import { prisma, Test } from "~/utils/db.server";
import { STATUS, TEST_STATUS } from "~/utils/helpers";

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

export const questions: Question[] = [
  {
    id: 0,
    isMultiple: true,
    question:
      "Which programming languages do you know? `console.log('Hello, World!')`",
    options: [
      { id: 0, text: "JavaScript" },
      { id: 1, text: "TypeScript" },
      { id: 2, text: "Python" },
      { id: 3, text: "Java" },
    ],
    correctAnswer: [0, 1], // User can select JavaScript and TypeScript
  },
  {
    id: 1,
    isMultiple: true,
    question: "Which front-end frameworks do you know?",
    options: [
      { id: 0, text: "React" },
      {
        id: 1,
        text: "Angularfdsakjhgfvbjnkm,;lkjhgfcvhbjnkm\
        jkhgfdhjkljhgfdsdfghjkjhgfdgh\
        hjgfdszxghjjhgfdszfxgchvjkhgfdgch\
        hbjfgdghjklhgfdxcgvhjkhghvjbnjhgv",
      },
      { id: 2, text: "Vue.js" },
      { id: 3, text: "Svelte" },
    ],
    correctAnswer: [0, 2], // User can select React and Vue.js
  },
  {
    id: 2,
    isMultiple: true,
    question: "Which back-end frameworks do you know?",
    options: [
      { id: 0, text: "Node.js" },
      { id: 1, text: "Django" },
      { id: 2, text: "Express.js" },
      { id: 3, text: "Spring" },
    ],
    correctAnswer: [0, 1], // User can select Node.js and Django
  },
  {
    id: 3,
    isMultiple: true,
    question: "Which databases do you know?",
    options: [
      { id: 0, text: "MySQL" },
      { id: 1, text: "PostgreSQL" },
      { id: 2, text: "MongoDB" },
      { id: 3, text: "SQLite" },
    ],
    correctAnswer: [0, 1, 2], // User can select MySQL, PostgreSQL, and MongoDB
  },
  {
    id: 4,
    question: "Which cloud providers do you know?",
    isMultiple: true,
    options: [
      { id: 0, text: "AWS" },
      { id: 1, text: "Azure" },
      { id: 2, text: "Google Cloud" },
      { id: 3, text: "DigitalOcean" },
    ],
    correctAnswer: [0, 1, 2], // User can select AWS, Azure, and Google Cloud
  },
  {
    id: 5,
    question: "Which version control systems do you know?",
    options: [
      { id: 0, text: "Git" },
      { id: 1, text: "SVN" },
      { id: 2, text: "Mercurial" },
      { id: 3, text: "Perforce" },
    ],
    correctAnswer: [0], // User can select Git
  },
  // Add more questions here
];

//################
// Server uitls
//################

/**
 * Get a test
 * @param request - The incoming request
 * @param params - The incoming params
 * @returns {Promise<Test>}
 */
export async function getTest(request: Request, params: Params<string>) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const userId = await getUserId(request);
  const id = searchParams.get("moduleId") ?? searchParams.get("submoduleId");
  const testId = params.testId;

  invariant(id, "ID is required to get Test");
  invariant(testId, "Test ID is required to get Test");

  try {
    const test = await getTestById(testId, id, userId);
    if (!test) {
      throw new Error("Test not found.");
    }
    if (test?.nextAttemptAt) {
      await scheduleStatusUpdate(testId, test.nextAttemptAt);
    }
    return test;
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
async function getTestById(testId: string, id: string, userId: string) {
  return prisma.test.findFirst({
    where: {
      id: testId,
      OR: [{ moduleId: { equals: id } }, { subModuleId: { equals: id } }],
      users: { some: { id: userId } },
    },
    include: {
      module: true,
      subModule: true,
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
  const { userId, score, intent, testId, moduleId, subModuleId } =
    await getFormData(request);
  invariant(intent, "Invalid intent");

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

    /**
     * If the user has attempted the test before, check if the score is above the cut off score, if it is, set the next attempt time to null, else set it to the next attempt time.
     * If the user has not attempted the test before, check if the score is below the cut off score, if it is, set the next attempt time to the next attempt time, else set it to null.
     */
    const testResponse = await updateTestStatus(testId, updateData);
    if (!testResponse) {
      throw new Error("Failed to update task.");
    }

    /**
     * Grab the checkpoint id from the module or sub module,
     * use it to update the checkpoint status
     */

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
        await updateNextModuleOrSubmodule(testResponse, moduleId, subModuleId);
      }
    }
    return testResponse;
  } catch (error) {
    throw error;
  }
}

async function getFormData(request: Request) {
  const formData = await request.formData();
  return {
    userId: await getUserId(request),
    score: Number(formData.get("score")),
    intent: String(formData.get("intent")),
    testId: String(formData.get("testId")),
    moduleId: formData.get("moduleId") as string | null,
    subModuleId: formData.get("subModuleId") as string | null,
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
  subModuleId: string | null
) {
  if (moduleId) {
    const nextModule = await prisma.module.findFirst({
      where: { id: moduleId, order: { gt: testResponse.module?.order } },
      orderBy: { order: "asc" },
    });
    if (nextModule) {
      await prisma.module.update({
        where: { id: nextModule.id },
        data: { status: STATUS.IN_PROGRESS },
      });
    } else {
      await updateCourseProject(moduleId);
    }
  } else {
    const nextSubmodule = await prisma.subModule.findFirst({
      where: { id: subModuleId!, order: { gt: testResponse.subModule?.order } },
      orderBy: { order: "asc" },
    });
    if (nextSubmodule) {
      await prisma.subModule.update({
        where: { id: nextSubmodule.id },
        data: { status: STATUS.IN_PROGRESS },
      });
    }
  }
}

async function updateCheckpointStatus(checkpointId: string, userId: string) {
  return prisma.checkpoint.update({
    where: { id: checkpointId, users: { some: { id: userId } } },
    data: { status: STATUS.IN_PROGRESS },
  });
}

async function updateCourseProject(moduleId: string) {
  const course = await prisma.course.findFirst({
    where: { modules: { some: { id: moduleId } } },
    include: { project: true },
  });

  if (!course?.project) return;
  await prisma.project.update({
    where: { id: course.project.id },
    data: { status: STATUS.IN_PROGRESS },
  });
}
