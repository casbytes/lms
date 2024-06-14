import { Params, redirect } from "@remix-run/react";
import JWT from "jsonwebtoken";
import invariant from "tiny-invariant";
import { BadRequestError } from "~/errors";
import { prisma } from "~/libs/prisma.server";

const { NODE_ENV: MODE, BASE_URL, DEV_BASE_URL } = process.env;
const PRODUCTION = MODE === "production";

export async function handleMagiclinkRedirect(request: Request, state: string) {
  const formData = await request.formData();
  const email = formData.get("email") as string;

  try {
    /**
     * Create db with token and email and verified status as false
     */
    // const user = await prisma.user.create({
    //   data: {
    //     email,
    //   },
    //   select: {
    //     email: true,
    //   },
    // });
    // invariant(user, "Failed to create user.");
    // const token = JWT.sign({ email: user.email }, process.env.SECRET!, {
    //   expiresIn: "1h",
    // });

    // const MAGIC_LINK = `${
    //   PRODUCTION ? BASE_URL : DEV_BASE_URL
    // }/magic-link.oauthcallback?state=${state}&token=${token}`;

    /**
     * Send email with magic link
     */
    const m = false;
    if (m) {
      return redirect(`/?email=${email}&success=true`);
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    throw new BadRequestError("Failed to generate magic link.");
  }
}

export async function handleMagiclinkAuth(
  request: Request,
  params: Params<string>
) {
  return null;
}
