import { google } from "googleapis";
import { BadRequestError } from "~/errors";
import {
  commitSessionOptions,
  getProviderCode,
  getUserSession,
} from "./sessions.server";
import { prisma } from "~/libs/prisma.server";
import { redirect } from "@remix-run/node";
import { Params } from "@remix-run/react";
import invariant from "tiny-invariant";

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } =
  process.env;

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

/**
 *  Generate Google auth URL
 * @param {String} state - Random string
 * @returns {String} - Google auth URL
 */
export async function handleGoogleRedirect(state: string) {
  const scopes = [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
  ];

  try {
    const authUrl = oauth2Client.generateAuthUrl({
      state,
      access_type: "offline",
      response_type: "code",
      scope: scopes,
      include_granted_scopes: true,
    });
    return authUrl;
  } catch (error) {
    throw new BadRequestError("Failed to generate Google auth URL.");
  }
}

/**
 * Handle Google auth
 * @param {Request} request - Request object
 * @param {Params<string>} params - Provider
 * @returns {Promise<Redirect> | null} - Redirect to current user url if any,
 * if not, onboarding or dashboard
 * @throws {BadRequestError} - Invalid provider
 */
export async function handleGoogleAuth(
  request: Request,
  params: Params<string>
) {
  invariant(params.provider, "Invalid provider.");
  const provider = params.provider;
  const session = await getUserSession(request);
  const code = await getProviderCode(request);
  session.unset("state");
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  const userInfo = await oauth2Client.request({
    url: "https://www.googleapis.com/oauth2/v3/userinfo",
  });

  const userData = userInfo.data as {
    sub: string;
    name: string;
    picture: string;
    email: string;
  } & Record<string, string>;
  console.log(userData);

  const { sub: googleId, name, picture: avatar_url, email } = userData;

  const existingUser = await prisma.user.findFirst({
    where: { googleId },
  });

  let user = null;
  if (!existingUser) {
    user = await prisma.user.create({
      data: { googleId },
    });
  }

  const payload = {
    email,
    name,
    avatar_url,
    authType: provider,
    id: existingUser?.id ?? user!.id,
  };
  session.set("sessionUser", payload);

  if (existingUser) {
    if (existingUser.completedOnboarding && existingUser?.currentUrl) {
      return redirect(
        existingUser.currentUrl,
        await commitSessionOptions(session)
      );
    } else if (existingUser.completedOnboarding && !existingUser?.currentUrl) {
      return redirect("/dashboard", await commitSessionOptions(session));
    }
  }
  return redirect("/onboarding", await commitSessionOptions(session));
}
