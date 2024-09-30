import crypto from "node:crypto";
import invariant from "tiny-invariant";
import JWT from "jsonwebtoken";
import { redirect, type Session } from "@remix-run/node";
import { prisma, User } from "./db.server";
import { Emails } from "~/services/resend/emails.server";
import {
  commitAuthSession,
  getUserSession,
  sessionKey,
} from "./session.server";
import { google } from "googleapis";
import { constructUsername, client } from "./helpers.server";
import { ROLE } from "./helpers";
import { STRIPE } from "~/services/stripe.server";

const {
  SECRET,
  BASE_URL,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} = process.env;

/**
 * Generate a random state string
 * @returns {string} - State
 * 
 * @example
 * const state = generateState();
 * state will be a random string of 64 characters
 */
function generateState() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Get avatar url
 * @param name - Name
 * @returns Avatar url
 * 
 * @example
 * const avatarUrl = getAvatarUrl("John");
 * avatarUrl will be "https://api.dicebear.com/9.x/avataaars/svg?seed=John"
 */
function getAvatarUrl(name: string) {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${name}`;
}

//######################
// Magic Link
//######################

/**
 * Handle magic link redirect
 * @param {Request} request - Request
 * @returns {Promise<TypedResponse<never>>}
 * @throws {Error}
 * 
 * @example
 * return await handleMagiclinkRedirect(request);
 * response will be a redirect to the magic link callback
 */
export async function handleMagiclinkRedirect(request: Request) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const authState = generateState();

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
    throw error;
  }
}

/**
 * Handle magic link callback
 * @param {Request} request - Request
 * @returns {Promise<TypedResponse<never>>}
 * @throws {Error}
 * 
 * @example
 * return await handleMagiclinkCallback(request);
 * response will be a redirect to the dashboard, onboarding page, admin page based on user role and onboarding status
 */
export async function handleMagiclinkCallback(request: Request) {
  const session = await getUserSession(request);
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  invariant(token, "Token is required.");

  try {
    const { email, authState } = JWT.verify(token, SECRET) as {
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
    return determineRedirectUrl(user, session);
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

//######################
// Google
//######################

const GOOGLE_REDIRECT_URL = `${BASE_URL}/google/callback`;

/**
 * Generate oauth2 client
 * @returns {Promise<google.auth.OAuth2>} - Oauth2 client
 * 
 * @example
 * const oauth2Client = await generateOauth2Client();
 * oauth2Client will be an instance of google.auth.OAuth2
 */
async function generateOauth2Client() {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URL
  );
}

/**
 * Handle google redirect
 * @returns {Promise<TypedResponse<never>>}
 * @throws {Error}
 * 
 * @example
 * return await handleGoogleRedirect();
 * response will be a redirect to the google callback
 */
export async function handleGoogleRedirect() {
  const SCOPES = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ];

  const oauth2Client = await generateOauth2Client();
  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    include_granted_scopes: true,
    state: generateState(),
  });
  return redirect(authorizationUrl);
}

/**
 * Handle google callback
 * @param {Request} request - Request
 * @returns {Promise<TypedResponse<never>>}
 * @throws {Error}
 * 
 * @example
 * return await handleGoogleCallback(request);
 * response will be a redirect to the dashboard, onboarding page, admin page based on user role and onboarding status
 */
export async function handleGoogleCallback(request: Request) {
  const session = await getUserSession(request);
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  invariant(state, "State is required to authenticate user.");

  if (error || !code) {
    session.flash(
      "error",
      error ?? "Failed to authenticate user, please try again."
    );
    throw redirect("/", await commitAuthSession(session));
  }

  const oauth2Client = await generateOauth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: "v2",
  });

  const { data: userInfo } = (await oauth2.userinfo.get()) as {
    data: { email: string; name: string; picture: string; given_name: string };
  };

  let user = await prisma.user.findUnique({
    where: { email: userInfo.email },
  });

  if (!user) {
    const stripeCustomer = await STRIPE.createCustomer({
      email: userInfo.email,
      name: userInfo.name,
    });

    const avatar_url = getAvatarUrl(userInfo.given_name);
    const data = {
      name: userInfo.name,
      email: userInfo.email,
      avatarUrl: userInfo?.picture?.trim() || avatar_url,
      stripeCustomerId: stripeCustomer.id,
      verified: true,
    };

    user = await prisma.user.create({
      data,
    });
    //send welcome email
  }

  session.set(sessionKey, user.id);
  return determineRedirectUrl(user, session);
}

//######################
// Github
//######################

const GITHUB_AUTH_REDIRECT_URL = `${BASE_URL}/github/callback`;

/**
 * Handle github redirect
 * @returns {Promise<TypedResponse<never>>}
 * @throws {Error}
 * 
 * @example
 * return await handleGithubRedirect();
 * response will be a redirect to the github callback
 */
export async function handleGithubRedirect() {
  const state = generateState();
  const REDIRECT_URL = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&state=${state}&scope=read:user&redirect_uri=${encodeURIComponent(
    GITHUB_AUTH_REDIRECT_URL
  )}&allow_signup=true&response_type=code`;

  return redirect(REDIRECT_URL);
}

/**
 * Get github access token
 * @param {string} code - Code
 * @param {string | null} error - Error
 * @param {Request} request - Request
 * @returns {Promise<string>} - Access token
 * @throws {Error}
 * 
 * @example
 * const accessToken = await getGithubAccessToken(code, error, request);
 * accessToken will be a string
 */
async function getGithubAccessToken(
  code: string,
  error: string | null,
  request: Request
): Promise<string> {
  const session = await getUserSession(request);
  const ACCESS_TOKEN_URL = `https://github.com/login/oauth/access_token?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&code=${code}&redirect_uri=${encodeURIComponent(
    GITHUB_AUTH_REDIRECT_URL
  )}`;

  type Response = {
    access_token: string;
    token_type: string;
    scope: string;
  };

  const tokenData = await client<Response>(ACCESS_TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  if (!tokenData?.access_token || error) {
    session.flash("error", error ?? "Authentication failed, please try again.");
    throw redirect("/", await commitAuthSession(session));
  }

  return tokenData.access_token;
}

type UserData = {
  name: string;
  email: string;
  login: string;
  avatar_url: string;
};

/**
 * Get github user data
 * @param {string} accessToken - Access token
 * @param {Request} request - Request
 * @returns {Promise<UserData>} - User data
 * @throws {Error}
 * 
 * @example
 * const userData = await getGithubUser(accessToken, request);
 * userData will be an object containing the user's name, email, login, and avatar_url
 */
async function getGithubUser(
  accessToken: string,
  request: Request
): Promise<UserData> {
  const session = await getUserSession(request);
  const AUTH_URL = "https://api.github.com/user";
  const userRes = await client<UserData>(AUTH_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!userRes) {
    session.flash("error", "Authentication failed, please try again.");
    throw redirect("/", await commitAuthSession(session));
  }

  return userRes;
}

/**
 * Handle github callback
 * @param {Request} request - Request
 * @returns {Promise<TypedResponse<never>>}
 * @throws {Error}
 * 
 * @example
 * return await handleGithubCallback(request);
 * response will be a redirect to the dashboard, onboarding page, admin page based on user role and onboarding status
 */
export async function handleGithubCallback(request: Request) {
  const session = await getUserSession(request);
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  invariant(code, "Code is required to authenticate user.");
  invariant(state, "State is required authenticate user.");

  const accessToken = await getGithubAccessToken(code, error, request);
  const githubUser = await getGithubUser(accessToken, request);

  let user = await prisma.user.findUnique({
    where: { email: githubUser.email },
  });

  if (!user) {
    const { firstName } = constructUsername(githubUser.name);
    const stripeCustomer = await STRIPE.createCustomer({
      email: githubUser.email,
      name: githubUser.name,
    });

    const avatar_url = getAvatarUrl(firstName);
    const data = {
      name: githubUser.name,
      email: githubUser.email,
      githubUsername: githubUser.login,
      avatarUrl: githubUser.avatar_url.trim() || avatar_url,
      stripeCustomerId: stripeCustomer.id,
      verified: true,
    };

    user = await prisma.user.create({
      data,
    });
    //send welcome email
  }

  session.set(sessionKey, user.id);
  return determineRedirectUrl(user, session);
}


/**
 * Determine redirect url based on user role and onboarding status
 * @param {User} user - User
 * @param {Session} session - Session
 * @returns {Promise<TypedResponse<never>>}
 * @throws {Error}
 * 
 * @example
 * return await determineRedirectUrl(user, session);
 * response will be a redirect to the dashboard, onboarding page, admin page based on user role and onboarding status
 */
async function determineRedirectUrl(user: User, session: Session) {
  const redirectUrl =
    user.role === ROLE.USER
      ? !user.completedOnboarding
        ? "/onboarding"
        : user.currentUrl ?? "/dashboard"
      : "/a";
  return redirect(redirectUrl, await commitAuthSession(session));
}
