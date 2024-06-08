import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { ICurrentUser, ISessionUser } from "~/constants/types";
import {
  InternalServerError,
  NotFoundError,
  UnAuthorizedError,
} from "~/errors";
import { prisma } from "~/libs/prisma.server";

export interface SessionData {
  currentUser: ISessionUser;
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

async function getUserSession(request: Request) {
  return await getSession(request.headers.get("Cookie"));
}

async function signOut(request: Request) {
  try {
    throw redirect("/", {
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

async function checkUser(request: Request) {
  try {
    const session = await getUserSession(request);
    const currentUser: ISessionUser | undefined = session?.get("currentUser");
    if (!currentUser || !currentUser.id) {
      throw redirect("/");
    }
    const dbUser = await prisma.user.findUnique({
      where: { id: currentUser.id },
    });
    if (!dbUser) {
      throw redirect("/");
    }
    return { ...currentUser, ...dbUser } as ICurrentUser;
  } catch (error) {
    throw new InternalServerError();
  }
}

async function getUser(request: Request): Promise<ICurrentUser> {
  try {
    const user = await checkUser(request);
    return user;
  } catch (error) {
    if (error instanceof UnAuthorizedError || error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError();
  }
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
