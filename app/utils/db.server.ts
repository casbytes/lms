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
  CourseProgress,
  ModuleProgress,
  SubModuleProgress,
  LessonProgress,
  Badge,
  Checkpoint,
  Test as ITest,
  Project,
  Link,
  TaskComment,
  Event as PEvent,
} from "@prisma/client";

export const prisma = remember("prisma", () => new PrismaClient());

type User = Omit<PUser, "createdAt" | "updatedAt"> & {
  createdAt: Date | string;
  updatedAt: Date | string;
};

type Event = Omit<PEvent, "createdAt" | "updatedAt" | "eventDate"> & {
  createdAt: Date | string;
  updatedAt: Date | string;
  eventDate: Date | string;
};

type Test = Omit<ITest, "nextAttemptAt"> & {
  nextAttemptAt: Date | string | null;
};

export type {
  Prisma,
  User,
  LearningTime,
  Course,
  Module,
  SubModule,
  Lesson,
  CourseProgress,
  ModuleProgress,
  SubModuleProgress,
  LessonProgress,
  Badge,
  Checkpoint,
  Test,
  Project,
  Link,
  TaskComment,
  Event,
};
