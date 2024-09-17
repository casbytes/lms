import { Session, createCookieSessionStorage, redirect } from "@remix-run/node";
import { type User, prisma } from "./db.server";
import { ROLE } from "./helpers";

export interface SessionData {
  userId: string;
}

interface SessionError {
  error: string;
}

const { SECRET, NODE_ENV, COOKIE_DOMAIN } = process.env;
const MODE = NODE_ENV;

export const sessionKey = "userId";

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionError>({
    cookie: {
      name: "__casbytes_session",
      secrets: [SECRET],
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      ...(MODE === "production" ? { domain: COOKIE_DOMAIN, secure: true } : {}),
    },
  });

/**
 * Get user session
 * @param request - Request
 * @returns {Session<SessionData SessionError>} - User session
 */
export async function getUserSession(
  request: Request
): Promise<Session<SessionData, SessionError>> {
  return getSession(request.headers.get("cookie"));
}

/**
 * Destroy session
 * @param {Session} session - Session
 * @returns {Promise<{headers}>} - Destroy session
 */
export async function destroyAuthSession(
  session: Session<SessionData, SessionError>
) {
  return {
    headers: {
      "set-cookie": await destroySession(session, { maxAge: 0 }),
    },
  };
}

/**
 * Commit session
 * @param {Session} session - Session
 * @returns {Promise<{headers}>} - Commit session
 */
export async function commitAuthSession(
  session: Session<SessionData, SessionError>
) {
  return {
    headers: {
      "set-cookie": await commitSession(session),
    },
  };
}

/**
 *  Sign out user
 * @param {Request} request - Request
 * @returns {TypedResponse<never>} - Redirect to home page
 */
export async function signOut(request: Request) {
  try {
    throw redirect(
      "/",
      await destroyAuthSession(await getUserSession(request))
    );
  } catch (error) {
    throw error;
  }
}

/**
 *  Get session user
 * @param request - Request
 * @returns {ISessionUser} - Session user
 */
export async function getUserId(request: Request): Promise<string> {
  try {
    const session = await getUserSession(request);
    const userId: string | undefined = session?.get(sessionKey);
    if (!userId) {
      session.flash("error", "Unauthorized.");
      throw redirect("/", await commitAuthSession(session));
    }
    return userId;
  } catch (error) {
    throw error;
  }
}

/**
 *  Get db user
 * @param {Request} request - Request
 * @returns {DBUser} - DB user
 */
export async function getUser(request: Request): Promise<User> {
  try {
    const session = await getUserSession(request);
    const userId = await getUserId(request);
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      if (session.has(sessionKey)) {
        session.unset(sessionKey);
      }
      session.flash("error", "Unauthorized.");
      throw redirect("/", await commitAuthSession(session));
    }
    return user;
  } catch (error) {
    throw error;
  }
}

export async function checkAdmin(request: Request) {
  try {
    const user = await getUser(request);
    const session = await getUserSession(request);
    if (user.role !== ROLE.ADMIN) {
      session.flash("error", "Forbidden.");
      throw redirect("/dashboard", await commitAuthSession(session));
    }
    return null;
  } catch (error) {
    throw error;
  }
}

export { getSession, commitSession, destroySession };
