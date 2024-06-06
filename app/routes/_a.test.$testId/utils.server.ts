import invariant from "tiny-invariant";
import schedule from "node-schedule";
import { Params } from "@remix-run/react";
import { ITest, TestStatus } from "~/constants/types";
import { BadRequestError, InternalServerError, NotFoundError } from "~/errors";
import { prisma } from "~/libs/prisma.server";
import { getUser } from "~/utils/sessions.server";

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
export async function getTest(request: Request, params: Params<string>) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const id = searchParams.get("moduleId") ?? searchParams.get("submoduleId");
  const testId = params.testId;

  try {
    invariant(id, "ID is required to get Test");
    invariant(testId, "Test ID is required to get Test");
    const user = await getUser(request);

    const test = await prisma.test.findFirst({
      where: {
        id: testId,
        OR: [
          {
            moduleProgressId: {
              equals: id,
            },
          },
          {
            subModuleProgressId: {
              equals: id,
            },
          },
        ],
        users: { some: { id: user.id } },
      },
      include: {
        moduleProgress: true,
        subModuleProgress: true,
      },
    });
    if (!test) {
      throw new NotFoundError("Test not found.");
    }

    if (test?.nextAttemptAt) {
      await scheduleStatusUpdate(testId, test.nextAttemptAt);
    }

    return test;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError();
  }
}

/**
 *  Schedule a status update for a test
 * @param {String} testId
 * @param {Date} nextAttemptAt
 * @returns {Promise<void>}
 */
async function scheduleStatusUpdate(testId: string, nextAttemptAt: Date) {
  if (!nextAttemptAt) return null;
  schedule.scheduleJob(nextAttemptAt, async () => {
    try {
      await prisma.test.update({
        where: { id: testId },
        data: { status: TestStatus.AVAILABLE },
      });
    } catch (error) {
      throw new InternalServerError(
        "An unexpected error occurred while trying to update test status in node schedule."
      );
    }
  });
}

//################
// Action uitls
//################
const CUT_OFF_SCORE = 80;

export async function handleTestSubmit(request: Request) {
  const formData = await request.formData();
  const score = Number(formData.get("score"));
  const intent = String(formData.get("intent"));
  const userId = String(formData.get("userId"));
  const testId = String(formData.get("testId"));
  const moduleProgressId = formData.get("moduleProgressId") as string | null;
  const subModuleProgressId = formData.get("subModuleProgressId") as
    | string
    | null;

  if (!intent) {
    throw new BadRequestError("Invalid intent.");
  }

  try {
    const existingTest = await prisma.test.findFirst({
      where: {
        id: testId,
        users: { some: { id: userId } },
        OR: [
          { moduleProgressId: { equals: moduleProgressId } },
          { subModuleProgressId: { equals: subModuleProgressId } },
        ],
      },
    });

    if (!existingTest) {
      throw new NotFoundError("Existing test not found.");
    }

    const updateData: {
      score: number;
      status: string;
      attempted: boolean;
      attempts: { increment: number };
      nextAttemptAt?: Date | null;
      users: { connect: { id: string } };
      moduleProgressId?: string | null;
      subModuleProgressId?: string | null;
    } = {
      score,
      status: score < CUT_OFF_SCORE ? TestStatus.LOCKED : TestStatus.COMPLETED,
      attempted: true,
      attempts: { increment: 1 },
      nextAttemptAt: null,
      users: { connect: { id: userId } },
      moduleProgressId:
        moduleProgressId === "null"
          ? null
          : moduleProgressId ?? existingTest.moduleProgressId,
      subModuleProgressId:
        subModuleProgressId === "null"
          ? null
          : subModuleProgressId ?? existingTest.subModuleProgressId,
    };

    const now = new Date();
    const attemptIncrement = 24 * 60 * 60 * 1000; // 1 day in milliseconds
    const daysUntilNextAttempt =
      (existingTest?.attempts === 0 ? 1 : existingTest.attempts + 1) *
      attemptIncrement;
    const nextAttemptTime = new Date(now.getTime() + daysUntilNextAttempt);

    if (existingTest?.nextAttemptAt) {
      if (score >= CUT_OFF_SCORE) {
        updateData.nextAttemptAt = null;
      } else {
        updateData.nextAttemptAt = nextAttemptTime;
      }
    } else {
      if (score < CUT_OFF_SCORE) {
        updateData.nextAttemptAt = nextAttemptTime;
      } else {
        updateData.nextAttemptAt = null;
      }
    }

    const testResponse = await prisma.test.update({
      where: {
        id: testId,
      },
      data: updateData,
    });

    if (!testResponse) {
      throw new NotFoundError("Failed to update task.");
    }

    console.log("Response", testResponse);

    return testResponse;
  } catch (error) {
    console.error(error);
    if (error instanceof NotFoundError || error instanceof BadRequestError) {
      throw error;
    }
    throw new InternalServerError("An unexpected error occurred.");
  }
}
