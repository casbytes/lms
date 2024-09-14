import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { prisma } from "./db.server";
import { ROLE } from "./helpers";
import {
  getUserSession,
  destroyAuthSession,
  commitAuthSession,
  signOut,
  getUserId,
  getUser,
  checkAdmin,
  handleMagiclinkRedirect,
  handleMagiclinkCallback,
  handleGoogleRedirect,
  handleGoogleCallback,
  handleGithubRedirect,
  handleGithubCallback,
} from "~/utils/session.server";

const server = setupServer(
  rest.post("https://api.dicebear.com/9.x/avataaars/svg", (req, res, ctx) => {
    return res(ctx.json({ url: "https://example.com/avatar.png" }));
  }),
  rest.post("https://github.com/login/oauth/access_token", (req, res, ctx) => {
    return res(ctx.json({ access_token: "fake-access-token" }));
  }),
  rest.get("https://api.github.com/user", (req, res, ctx) => {
    return res(
      ctx.json({
        name: "John Doe",
        email: "john.doe@example.com",
        login: "johndoe",
        avatar_url: "https://example.com/avatar.png",
      })
    );
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

describe("Session Server", () => {
  it("should get user session", async () => {
    const request = new Request("http://localhost", {
      headers: { cookie: "__casbytes_session=some-session-id" },
    });
    const session = await getUserSession(request);
    expect(session).toBeDefined();
  });

  it("should destroy auth session", async () => {
    const session = await getUserSession(
      new Request("http://localhost", {
        headers: { cookie: "__casbytes_session=some-session-id" },
      })
    );
    const result = await destroyAuthSession(session);
    expect(result.headers["set-cookie"]).toContain("Max-Age=0");
  });

  it("should commit auth session", async () => {
    const session = await getUserSession(
      new Request("http://localhost", {
        headers: { cookie: "__casbytes_session=some-session-id" },
      })
    );
    const result = await commitAuthSession(session);
    expect(result.headers["set-cookie"]).toBeDefined();
  });

  it("should sign out user", async () => {
    const request = new Request("http://localhost", {
      headers: { cookie: "__casbytes_session=some-session-id" },
    });
    await expect(signOut(request)).rejects.toThrow();
  });

  it("should get user id", async () => {
    const request = new Request("http://localhost", {
      headers: { cookie: "__casbytes_session=some-session-id" },
    });
    const userId = await getUserId(request);
    expect(userId).toBeDefined();
  });

  it("should get user", async () => {
    const request = new Request("http://localhost", {
      headers: { cookie: "__casbytes_session=some-session-id" },
    });
    prisma.user.findUnique = jest.fn().mockResolvedValue({ id: "user-id" });
    const user = await getUser(request);
    expect(user).toBeDefined();
  });

  it("should check admin", async () => {
    const request = new Request("http://localhost", {
      headers: { cookie: "__casbytes_session=some-session-id" },
    });
    prisma.user.findUnique = jest.fn().mockResolvedValue({ role: ROLE.ADMIN });
    await expect(checkAdmin(request)).resolves.toBeNull();
  });

  it("should handle magic link redirect", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      body: new URLSearchParams({ email: "test@example.com" }),
    });
    prisma.user.findUnique = jest.fn().mockResolvedValue(null);
    prisma.user.create = jest.fn().mockResolvedValue({});
    await expect(handleMagiclinkRedirect(request)).resolves.toBeDefined();
  });

  it("should handle magic link callback", async () => {
    const request = new Request("http://localhost?token=fake-token");
    prisma.user.findUnique = jest.fn().mockResolvedValue({
      email: "test@example.com",
      verificationToken: "fake-token",
      authState: "fake-state",
      verified: true,
      name: "Test User",
    });
    await expect(handleMagiclinkCallback(request)).resolves.toBeDefined();
  });

  it("should handle google redirect", async () => {
    await expect(handleGoogleRedirect()).resolves.toBeDefined();
  });

  it("should handle google callback", async () => {
    const request = new Request(
      "http://localhost?code=fake-code&state=fake-state"
    );
    prisma.user.findUnique = jest.fn().mockResolvedValue(null);
    prisma.user.create = jest.fn().mockResolvedValue({});
    await expect(handleGoogleCallback(request)).resolves.toBeDefined();
  });

  it("should handle github redirect", async () => {
    await expect(handleGithubRedirect()).resolves.toBeDefined();
  });

  it("should handle github callback", async () => {
    const request = new Request(
      "http://localhost?code=fake-code&state=fake-state"
    );
    prisma.user.findUnique = jest.fn().mockResolvedValue(null);
    prisma.user.create = jest.fn().mockResolvedValue({});
    await expect(handleGithubCallback(request)).resolves.toBeDefined();
  });
});
