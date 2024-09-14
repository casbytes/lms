import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset } from "vitest-mock-extended";
import "@testing-library/jest-dom/vitest";
import { server } from "../../app/mocks/node";

beforeAll(() => {
  server.listen();
});

beforeEach(() => {
  mockReset(prisma);
});
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

afterAll(() => {
  server.close();
});

export const prisma = mockDeep<PrismaClient>();
