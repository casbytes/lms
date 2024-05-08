import { redirect } from "@remix-run/node";

const { GITHUB_CLIENT_ID, GITHUB_REDIRECT_URI } = process.env;

export async function action() {
  const SCOPE = "read:user";
  try {
    const AUTH_URI = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}&scope=${SCOPE}&allow_signup=true&login=oauth`;
    return redirect(AUTH_URI);
  } catch (error) {
    throw new Error("An error occured during redirect, please try again.");
  }
}
