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

/**
 * Create cookie session storage
 * @returns {CookieSessionStorage} - Cookie session storage
 */
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
 * @param {Request} request - Request
 * @returns {Promise<Session<SessionData, SessionError>>} - User session
 */
export async function getUserSession(
  request: Request
): Promise<Session<SessionData, SessionError>> {
  return getSession(request.headers.get("cookie"));
}

/**
 * Destroy auth session
 * @param {Session<SessionData, SessionError>} session - Session
 * @returns {Promise<{headers}>} - Destroy auth session
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
 * Commit auth session
 * @param {Session<SessionData, SessionError>} session - Session
 * @returns {Promise<{headers}>} - Commit auth session
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
 * Sign out user
 * @param {Request} request - Request
 * @returns {Promise<TypedResponse<never>>} - Redirect to home page
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
 * Get session user id
 * @param {Request} request - Request
 * @returns {Promise<string>} - Session user id
 * @throws {Error} If the user is not found
 * 
 * @example
 * const userId = await getUserId(request);
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
 * Get user
 * @param {Request} request - Request
 * @returns {Promise<User>} - User
 * @throws {Error} If the user is not found
 * 
 * @example
 * const user = await getUser(request);
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

/**
 * Check if the user is an admin
 * @param {Request} request - Request
 * @returns {Promise<void>} - Redirect to home page
 * @throws {Error} If the user is not an admin
 * 
 * @example
 * await checkAdmin(request);
 */
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
