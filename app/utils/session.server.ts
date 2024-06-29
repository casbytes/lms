import crypto from "node:crypto";
import JWT from "jsonwebtoken";
import invariant from "tiny-invariant";
import {
  Session,
  createCookieSessionStorage,
  redirect,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { ensurePrimary } from "./litefs.server";
import { InternalServerError } from "~/errors";
import { prisma, types } from "./db.server";
import { Emails } from "~/services/resend/emails.server";
import { Role } from "~/constants/enums";

export interface SessionData {
  userId: string;
  authState: string | null;
}

export const adminRoles: Role[] = [
  Role.ADMIN,
  Role.MODERATOR,
  Role.TRAINER,
  Role.MENTOR,
];

const { SECRET, NODE_ENV, BASE_URL, DEV_BASE_URL } = process.env;
const MODE = NODE_ENV;

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData>({
    cookie: {
      name: "__casbytes_session",
      secrets: [SECRET],
      // domain: COOKIE_DOMAIN,
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
 * @returns {Session<SessionData SessionData>} - User session
 */
export async function getUserSession(request: Request) {
  return getSession(request.headers.get("Cookie"));
}

/**
 *  Sign out user
 * @param {Request} request - Request
 * @returns {TypedResponse<never>} - Redirect to home page
 */
export async function signOut(request: Request) {
  try {
    return redirect("/", {
      headers: {
        "Set-Cookie": await destroySession(await getUserSession(request), {
          maxAge: 0,
        }),
      },
    });
  } catch (error) {
    throw new InternalServerError("Failed to sign out, please try again.");
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
    const userId: string | undefined = session?.get("userId");
    if (!userId) {
      throw redirect("/");
    }
    return userId;
  } catch (error) {
    throw new InternalServerError(
      "Failed to get session user, please try refreshing your page."
    );
  }
}

/**
 *  Get db user
 * @param {Request} request - Request
 * @returns {DBUser} - DB user
 */
export async function getUser(request: Request): Promise<types.User> {
  try {
    const userId = await getUserId(request);
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw redirect("/");
    }
    return user;
  } catch (error) {
    throw new InternalServerError(
      "Failed to get user from DB, please try again."
    );
  }
}

export async function checkRole(request: Request) {
  try {
    const user = await getUser(request);
    if (!adminRoles.includes(user.role as Role)) {
      throw redirect("/dashboard");
    }
    return null;
  } catch (error) {
    throw new InternalServerError("Failed to check role, please try again.");
  }
}

/**
 * Commit session
 * @param {Session} session - Session
 * @returns {Promise<{headers}>} - Commit session
 */
export async function commitAuthSession(session: Session<SessionData>) {
  return {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  };
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
    if (MODE === "production") {
      await ensurePrimary();
    }
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
        select: { email: true },
      });
    } else {
      await prisma.user.update({
        where: { email },
        data: { verificationToken: token, authState },
      });
    }

    const MAGIC_LINK = `${
      MODE === "production" ? BASE_URL : DEV_BASE_URL
    }/magic-link/callback?token=${token}`;

    const { data, error } = await Emails.sendMagicLink({
      email: existingUser?.email ?? email!,
      link: MAGIC_LINK,
    });

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

    throw new InternalServerError("Failed to generate magic link.");
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
  const session = await getUserSession(request);
  invariant(params.provider, "Invalid provider.");
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  try {
    invariant(token, "Invalid token.");
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
      return redirect(`/verify-email?email=${encodeURIComponent(email)}`);
    } else {
      await prisma.user.update({
        where: { email },
        data: { verificationToken: null, authState: null },
      });
    }

    session.set("userId", user.id);

    if (adminRoles.includes(user.role as Role)) {
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
    }
    throw new InternalServerError("Failed to authenticate user.");
  }
}

export { getSession, commitSession, destroySession };
