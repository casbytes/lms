import crypto from "node:crypto";
import JWT from "jsonwebtoken";
import invariant from "tiny-invariant";
import {
  Session,
  createCookieSessionStorage,
  redirect,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { type User, prisma } from "./db.server";
import { Emails } from "~/services/resend/emails.server";
import { ROLE } from "./helpers";

export interface SessionData {
  userId: string;
}

interface SessionError {
  error: string;
}

const { SECRET, NODE_ENV, BASE_URL, COOKIE_DOMAIN } = process.env;
const MODE = NODE_ENV;

export const sessionKey = "userId";

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionError>({
    cookie: {
      name: "__casbytes_session",
      secrets: [SECRET],
      domain: COOKIE_DOMAIN,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: MODE === "production",
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
    return redirect(
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
    if (user.role !== (ROLE.ADMIN as ROLE)) {
      session.flash("error", "Forbidden.");
      throw redirect("/dashboard");
    }
    return null;
  } catch (error) {
    throw error;
  }
}

/**
 * Handle magic link redirect
 * @param request - Request
 * @returns {TypedResponse<never>}
 */
export async function handleMagiclinkRedirect(request: Request) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const authState = crypto.randomBytes(16).toString("hex");

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { email: true },
    });

    const token = JWT.sign({ email, authState }, SECRET!, {
      expiresIn: "30m",
    });

    if (!existingUser) {
      await prisma.user.create({
        data: { email, verificationToken: token, authState },
      });
    } else {
      await prisma.user.update({
        where: { email },
        data: { verificationToken: token, authState },
      });
    }

    const MAGIC_LINK = `${BASE_URL}/magic-link/callback?token=${token}`;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, error } = await Emails.sendMagicLink({
      email: existingUser?.email ?? email!,
      link: MAGIC_LINK,
    });

    console.log(error);

    /**
     * The data will be used to add users to mailing list
     */

    if (error) {
      return redirect(
        `/?email=${encodeURIComponent(
          email
        )}&success=false&error=${encodeURIComponent(error.message)}`
      );
    }
    return redirect(`/?email=${encodeURIComponent(email)}&success=true`);
  } catch (error) {
    console.error(error);

    throw error;
  }
}

/**
 * Handle magic link authentication
 * @param {Request} request - Request
 * @param {Params<string>} params - Params
 * @returns {null | TypedResponse<never>}
 */
export async function handleMagiclinkAuth({
  request,
  params,
}: LoaderFunctionArgs) {
  invariant(params.provider, "Invalid provider.");
  const session = await getUserSession(request);
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  invariant(token, "Token is required.");

  try {
    const { email, authState } = JWT.verify(token, SECRET!) as {
      email: string;
      authState: string;
    };

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (
      !user ||
      user.verificationToken !== token ||
      user.authState !== authState
    ) {
      return redirect("/?error=Invalid token.");
    }

    if (!user.verified || !user.name) {
      return redirect(`/update-profile?email=${encodeURIComponent(email)}`);
    } else {
      await prisma.user.update({
        where: { email },
        data: { verificationToken: null, authState: null },
      });
    }

    session.set(sessionKey, user.id);

    if (user.role === (ROLE.ADMIN as ROLE)) {
      return redirect("/a", await commitAuthSession(session));
    } else {
      const redirectUrl = user.completedOnboarding
        ? user.currentUrl ?? "/dashboard"
        : "/onboarding";

      return redirect(redirectUrl, await commitAuthSession(session));
    }
  } catch (error) {
    if (error instanceof JWT.TokenExpiredError) {
      const message =
        "Your token has expired. Please generate another magic link.";
      return redirect(`/?success=false&error=${encodeURIComponent(message)}`);
    } else if (error instanceof JWT.JsonWebTokenError) {
      return redirect(
        `/?success=false&error=${encodeURIComponent(error.message)}`
      );
    }
    throw error;
  }
}

export { getSession, commitSession, destroySession };
