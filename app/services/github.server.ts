import { GitHubStrategy } from "remix-auth-github";
import { prisma } from "~/libs/prisma.server";
import { ISessionUser } from "~/constants/types";
import { BadRequestError } from "~/errors";
import {
  commitSessionOptions,
  getProviderCode,
  getUserSession,
} from "./sessions.server";
import { redirect } from "@remix-run/node";
import { Params } from "@remix-run/react";
import invariant from "tiny-invariant";

const {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_REDIRECT_URI,
  BASE_URL,
} = process.env;

export async function handleGithubRedirect(state: string) {
  const SCOPE = "read:user";
  try {
    const AUTH_URI = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}&scope=${SCOPE}&allow_signup=true&login=oauth&state=${state}`;
    return AUTH_URI;
  } catch (error) {
    throw new BadRequestError("Failed to generate GitHub auth URL.");
  }
}

export async function handleGithubAuth(
  request: Request,
  params: Params<string>
) {
  const session = await getUserSession(request);
  const code = await getProviderCode(request);
  session.unset("state");
  invariant(params.provider, "Invalid provider.");
  const provider = params.provider;
  const LOGIN_URL = `https://github.com/login/oauth/access_token?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&code=${code}`;
  const data = await fetch(LOGIN_URL, {
    headers: {
      Accept: "application/json",
    },
  }).then((res) => res.json());

  const accessToken = new URLSearchParams(data).get("access_token");
  const AUTH_URL = "https://api.github.com/user";
  const response = await fetch(AUTH_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  invariant(response.ok, "Failed to authenticate with GitHub.");
  const userData = await response.json();
  const { id: githubId, email, name, avatar_url } = userData;

  const existingUser = await prisma.user.findUnique({
    where: { githubId },
  });

  let user = null;
  if (!existingUser) {
    user = await prisma.user.create({
      data: { githubId },
    });
    // await sendWelcomeEmail({ email, name });
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
    if (existingUser.completedOnboarding && existingUser.currentUrl) {
      return redirect(
        existingUser.currentUrl,
        await commitSessionOptions(session)
      );
    } else if (existingUser.completedOnboarding && !existingUser.currentUrl) {
      return redirect("/dashboard", await commitSessionOptions(session));
    }
  }
  return redirect("/onboarding", await commitSessionOptions(session));
}
