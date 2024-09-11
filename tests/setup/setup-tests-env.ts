import { afterEach, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset } from "vitest-mock-extended";
import "@testing-library/jest-dom/vitest";

beforeEach(() => {
  mockReset(prisma);
});
afterEach(() => cleanup());

export const prisma = mockDeep<PrismaClient>();
