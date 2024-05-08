import { redirect } from "@remix-run/node";
import { oauth2Client } from "~/services/google";

export async function action() {
  const scopes = [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
  ];

  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      response_type: "code",
      scope: scopes,
      include_granted_scopes: true,
    });
    return redirect(authUrl);
  } catch (error) {
    throw new Error("An error occured during redirect, please try again.");
  }
}
