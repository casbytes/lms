import axios from "axios";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useRouteError } from "@remix-run/react";
import { commitSession, getUserSession } from "./sessions";
import { sendWelcomeEmail } from "~/services/mailtrap";
import { prisma } from "~/libs/prisma.server";
import { RootErrorUI } from "~/components/root-error-ui";

const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env;

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description") as string;
  if (error) {
    throw new Error(errorDescription);
  }

  if (!code) {
    throw new Error("No code provided.");
  }

  try {
    const LOGIN_URL = `https://github.com/login/oauth/access_token?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&code=${code}`;
    const { data } = await axios.post(LOGIN_URL, {
      headers: {
        Accept: "application/json",
      },
    });

    const accessToken = new URLSearchParams(data).get("access_token");

    const AUTH_URL = "https://api.github.com/user";

    const {
      data: { id: githubId, email, name, avatar_url },
    } = await axios.get(AUTH_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const existingUser = await prisma.user.findUnique({
      where: { githubId },
    });

    let user;

    /**
     * If there is no existing user, create one and welcome them
     * with an email
     */
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
      authType: "github",
      userId: existingUser?.id ?? user!.id,
      currentUrl: existingUser?.currentUrl ?? null,
      completedOnboarding:
        existingUser?.completedOnboarding ?? user!.completedOnboarding,
    };

    const session = await getUserSession(request);
    session.set("currentUser", payload);

    const commitSessionOptions = {
      headers: {
        "Set-Cookie": await commitSession(session, {
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        }),
      },
    };

    if (existingUser) {
      if (existingUser.completedOnboarding && existingUser.currentUrl) {
        return redirect(existingUser.currentUrl, commitSessionOptions);
      } else if (existingUser.completedOnboarding && !existingUser.currentUrl) {
        return redirect("/dashboard", commitSessionOptions);
      }
    }

    return redirect("/onboarding", commitSessionOptions);
  } catch (error) {
    throw new Error("An error occurred wile signing in. Please try again.");
  }
}

export function ErrorBoundary() {
  const error = useRouteError();
  return <RootErrorUI error={error} />;
}
