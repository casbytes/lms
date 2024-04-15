import { createCookieSessionStorage } from "@remix-run/node";

export interface CurrentUser {
  userId: string;
  email: string;
  name: string;
  avatar_url: string;
  authType: string;
  completedOnboarding: boolean;
}

export interface SessionData {
  currentUser: CurrentUser;
}

export interface SessionFlashData {
  error: string;
}

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: "__casbytes",
      secrets: [process.env.SECRET!],
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  });

export { getSession, commitSession, destroySession };
