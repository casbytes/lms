import { remember } from "@epic-web/remember";
import { PrismaClient } from "@prisma/client";
import chalk from "chalk";
export const prisma = remember("prisma", () => new PrismaClient());
export * as types from "@prisma/client";
