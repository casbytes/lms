import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import JWT from "jsonwebtoken";
import { prisma } from "~/libs/prisma";
import { oauth2Client } from "~/services/google";
import { getUserSession } from "~/utils/session.server";
import { commitSession } from "./sessions";

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
      throw new Error("No code provided.");
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

    let user: { id: string; completedOnboarding: boolean } | null = null;

    if (!existingUser) {
      user = await prisma.user.create({
        data: { googleId },
      });
    }

    const payload = {
      email,
      name,
      avatar_url,
      authType: "github",
      userId: existingUser?.id ?? user!.id,
      completedOnboarding:
        existingUser?.completedOnboarding ?? user!.completedOnboarding,
    };

    const session = await getUserSession(request);
    session.set("currentUser", payload);
    /**
     * ! Send welcome email
     */

    const commitSessionOptions = {
      headers: {
        "Set-Cookie": await commitSession(session, {
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        }),
      },
    };

    if (existingUser && existingUser.completedOnboarding) {
      return redirect("/dashboard", commitSessionOptions);
    }

    return redirect("/onboarding", commitSessionOptions);
  } catch (error) {
    throw error;
  }
}
