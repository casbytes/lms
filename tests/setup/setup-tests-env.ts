import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { mockReset } from "vitest-mock-extended";
import { server } from "../mocks/node";
import { prisma } from "../mocks/prisma";
import "@testing-library/jest-dom/vitest";

vi.mock("../mocks/prisma");

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
