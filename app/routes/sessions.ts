import { createCookieSessionStorage } from "@remix-run/node";
import { ICurrentUser } from "~/constants/types";

export interface SessionData {
  currentUser: ICurrentUser;
}

export interface SessionFlashData {
  error: string;
}

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: "__casbytes",
      secrets: [process.env.SECRET!],
      domain: process.env.COOKIE_DOMAIN,
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  });

export { getSession, commitSession, destroySession };
