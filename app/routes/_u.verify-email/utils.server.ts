import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { Role } from "~/constants/types";
import { InternalServerError } from "~/errors";
import { createStripeCustomer } from "~/services/stripe.server";
import { prisma } from "~/utils/db.server";
import {
  adminRoles,
  commitAuthSession,
  getUserSession,
} from "~/utils/session.server";

export async function getEmail(request: Request) {
  try {
    const email = new URL(request.url).searchParams.get("email");
    if (!email) {
      throw redirect("/");
    }
    return email;
  } catch (error) {
    throw new InternalServerError("Failed to process request.");
  }
}

export async function updateUser(request: Request) {
  try {
    const session = await getUserSession(request);
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    const intent = formData.get("intent") as string;

    invariant(email, "Email is required.");
    invariant(name, "Name is required.");
    invariant(intent === "submit", "Invalid intent.");

    const stripeCustomer = await createStripeCustomer({ email, name });
    if (!stripeCustomer.id) {
      throw new InternalServerError("Failed to create stripe customer.");
    }
    const user = await prisma.user.update({
      where: { email },
      data: {
        name,
        verified: true,
        verificationToken: null,
        authState: null,
        stripeCustomerId: stripeCustomer.id,
      },
    });

    if (!user.name || !user.verified) {
      throw redirect("/");
    }

    session.set("userId", user.id);

    const redirectUrl = adminRoles.includes(user.role as Role)
      ? "/a"
      : "/onboarding";
    return redirect(redirectUrl, await commitAuthSession(session));
  } catch (error) {
    throw error;
  }
}
