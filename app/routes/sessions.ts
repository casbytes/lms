import { createCookieSessionStorage, redirect } from "@remix-run/node";
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
    throw new Error("An error occur while signing out, please try again.");
  }
}

async function requireUser(request: Request) {
  try {
    const session = await getUserSession(request);
    const user = session?.get("currentUser");
    const userId = user?.userId;
    if (!user || !userId) {
      await signOut(request);
    }
    return user as ICurrentUser;
  } catch (error) {
    throw new Error("An error occured while accessing user session.");
  }
}

async function getUser(request: Request): Promise<ICurrentUser> {
  try {
    const user = (await requireUser(request)) as ICurrentUser;
    return user;
  } catch (error) {
    throw new Error("An error occured while getting user.");
  }
}

// const cacheOptions = {
//   headers: {
//     "Cache-Control": "max-age=604800, public",
//   },
// };

const cacheOptions = {
  headers: {
    "Cache-Control": "no-cache, must-revalidate",
  },
};

export {
  getSession,
  commitSession,
  destroySession,
  getUser,
  signOut,
  getUserSession,
  cacheOptions,
};
