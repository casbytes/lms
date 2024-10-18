import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { STRIPE } from "~/services/stripe.server";
import { prisma } from "~/utils/db.server";
import { ROLE } from "~/utils/helpers";
import { constructUsername } from "~/utils/helpers.server";
import {
  commitAuthSession,
  getUserSession,
  sessionKey,
} from "~/utils/session.server";

export async function getEmail(request: Request) {
  try {
    const email = new URL(request.url).searchParams.get("email");
    if (!email) {
      const session = await getUserSession(request);
      session.flash("error", "Email is required to update user.");
      throw redirect("/", await commitAuthSession(session));
    }
    return email;
  } catch (error) {
    throw error;
  }
}

export async function updateUser(request: Request) {
  try {
    const session = await getUserSession(request);
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    const githubUsername = formData.get("githubUsername") as string | null;
    const intent = formData.get("intent") as string;

    invariant(email, "Email is required.");
    invariant(name, "Name is required.");
    invariant(intent === "submit", "Invalid intent.");

    const { firstName } = constructUsername(name);
    const stripeCustomer = await STRIPE.createCustomer({ email, name });

    const avatar_url = `https://api.dicebear.com/9.x/avataaars/svg?seed=${firstName}`;

    const user = await prisma.user.update({
      where: { email },
      data: {
        name,
        githubUsername,
        avatarUrl: avatar_url,
        verified: true,
        verificationToken: null,
        authState: null,
        stripeCustomerId: stripeCustomer.id,
      },
      select: { id: true, name: true, verified: true, role: true },
    });

    if (!user.name || !user.verified) {
      session.flash("error", "Failed to update user.");
      throw redirect("/", await commitAuthSession(session));
    }

    session.set(sessionKey, user.id);

    const redirectUrl = user.role === ROLE.ADMIN ? "/a" : "/onboarding";
    return redirect(redirectUrl, await commitAuthSession(session));
  } catch (error) {
    throw error;
  }
}
