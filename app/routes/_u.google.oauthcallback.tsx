import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import JWT from "jsonwebtoken";
import { oauth2Client } from "~/services/google";
import { commitSession, getUserSession } from "./sessions";
import { sendWelcomeEmail } from "~/services/mailtrap";
import { prisma } from "~/libs/prisma.server";
import { useRouteError } from "@remix-run/react";
import { RootErrorUI } from "~/components/root-error-ui";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description") as string;
  if (error) {
    throw new Error(errorDescription);
  }

  try {
    if (!code) {
      throw new Error("No google auth code provided.");
    }
    const { tokens } = await oauth2Client.getToken(code);
    const { payload: decodedPayload } = JWT.decode(tokens.id_token!, {
      complete: true,
    }) as unknown as {
      payload: { sub: string; name: string; email: string; picture: string };
    };

    if (!decodedPayload) {
      throw new Error("Failed to decode ID token.");
    }

    const { sub: googleId, name, email, picture: avatar_url } = decodedPayload;
    const existingUser = await prisma.user.findFirst({
      where: { googleId },
    });

    let user;

    /**
     * If there is no existing user, create one and welcome them
     * with an email
     */
    if (!existingUser) {
      user = await prisma.user.create({
        data: { googleId },
      });
      // await sendWelcomeEmail({ email, name });
    }

    const payload = {
      email,
      name,
      avatar_url,
      authType: "google",
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
