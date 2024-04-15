import { redirect } from "@remix-run/node";
import { CurrentUser, destroySession, getSession } from "~/routes/sessions";

async function getUserSession(request: Request) {
  return await getSession(request.headers.get("Cookie"));
}

async function signOut(request: Request) {
  throw redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(await getUserSession(request), {
        maxAge: 0,
      }),
    },
  });
}

async function requireUser(request: Request) {
  const session = await getUserSession(request);
  const user = session?.get("currentUser");
  const userId = user?.userId;
  if (!user || !userId) {
    await signOut(request);
  }
  return user as CurrentUser;
}

async function getUser(request: Request): Promise<CurrentUser> {
  const user = await requireUser(request);
  return user;
}

export { getUser, signOut, getUserSession };
