import chalk from "chalk";
import { remember } from "@epic-web/remember";

import {
  Prisma,
  PrismaClient,
  User as PUser,
  LearningTime,
  Course,
  Module,
  SubModule,
  Lesson,
  Badge,
  Checkpoint,
  Test as ITest,
  Project,
  Reviews,
} from "@prisma/client";


type User = Omit<PUser, "createdAt" | "updatedAt"> & {
  createdAt: Date | string;
  updatedAt: Date | string;
};

type Test = Omit<ITest, "nextAttemptAt"> & {
  nextAttemptAt: Date | string | null;
};

type MDX = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: { [key: string]: any };
  content: string;
};

export type {
  Prisma,
  User,
  LearningTime,
  Course,
  Module,
  SubModule,
  Lesson,
  Badge,
  Checkpoint,
  Test,
  Project,
  Reviews,
  MDX,
};

/**
 * Create Prisma client
 * @returns {PrismaClient} - Prisma client
 * @throws {Error} If there's an error during the database operation
 * 
 * @example
 *  const user = await prisma.user.findUnique({
 *   where: {
 *     id: 1,
 *   },
 * });
 * 
 * const users = await prisma.user.findMany();
 * 
 * const newUser = await prisma.user.create({
 *   data: {
 *     name: "John Doe",
 *     email: "john.doe@example.com",
 *   },
 * });
 */
export const prisma = remember("prisma", () => {
  const logThreshold = 20;

  const client = new PrismaClient({
    log: [
      { level: "query", emit: "event" },
      { level: "error", emit: "stdout" },
      { level: "warn", emit: "stdout" },
    ],
  });
  client.$on("query", async (e) => {
    if (e.duration < logThreshold) return;
    const color =
      e.duration < logThreshold * 1.1
        ? "green"
        : e.duration < logThreshold * 1.2
        ? "blue"
        : e.duration < logThreshold * 1.3
        ? "yellow"
        : e.duration < logThreshold * 1.4
        ? "redBright"
        : "red";
    const dur = chalk[color](`${e.duration}ms`);
    // eslint-disable-next-line no-console
    console.info(`prisma:query - ${dur} - ${e.query}`);
  });
  void client.$connect();
  return client;
});
