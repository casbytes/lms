import { Session, createCookieSessionStorage, redirect } from "@remix-run/node";
import { ICurrentUser, ISessionUser, IUser } from "~/constants/types";
import { InternalServerError } from "~/errors";
import { prisma } from "~/libs/prisma.server";
import invariant from "tiny-invariant";

export interface SessionData {
  sessionUser: ISessionUser;
  state: string | null;
}

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData>({
    cookie: {
      name: "__casbytes",
      secrets: [process.env.SECRET!],
      domain: process.env.COOKIE_DOMAIN,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  });

async function getUserSession(request: Request) {
  return getSession(request.headers.get("Cookie"));
}

async function signOut(request: Request) {
  try {
    return redirect("/", {
      headers: {
        "Set-Cookie": await destroySession(await getUserSession(request), {
          maxAge: 0,
        }),
      },
    });
  } catch (error) {
    throw new InternalServerError();
  }
}

/**
 * Merge session user and db user
 * @param {ICurrentUser} sessionUser - Session user
 * @param {DBUser} dbUser - DB user
 * @returns {ICurrentUser} - Merged user
 */
function mergeUsers(sessionUser: ISessionUser, dbUser: IUser): ICurrentUser {
  return {
    ...sessionUser,
    ...dbUser,
    name: sessionUser?.name ?? dbUser?.name,
    email: sessionUser?.email ?? dbUser?.email,
  };
}

async function checkUser(request: Request) {
  try {
    const session = await getUserSession(request);
    const sessionUser: ISessionUser | undefined = session?.get("sessionUser");
    if (!sessionUser || !sessionUser.id) {
      throw redirect("/");
    }
    if (!sessionUser) {
      throw redirect("/");
    }
    const dbUser = await prisma.user.findUnique({
      where: { id: sessionUser.id },
    });

    if (!dbUser) {
      throw redirect("/");
    }
    return mergeUsers(sessionUser, dbUser);
  } catch (error) {
    throw error;
  }
}

async function getUser(request: Request): Promise<ICurrentUser> {
  try {
    const user = await checkUser(request);
    return user;
  } catch (error) {
    throw error;
  }
}

export async function commitSessionOptions(session: Session<SessionData>) {
  return {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  };
}

export async function getProviderCode(request: Request) {
  const session = await getUserSession(request);
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description") as string;
  invariant(code, "No auth code provided.");
  invariant(state === session.get("state"), "Invalid state.");
  invariant(!error, errorDescription);
  return code;
}

const cacheOptions = {
  headers: {
    "Cache-Control": "no-cache, must-revalidate",
  },
};

export {
  getSession,
  commitSession,
  destroySession,
  checkUser,
  getUser,
  signOut,
  getUserSession,
  cacheOptions,
};
