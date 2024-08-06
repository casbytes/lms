import { LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "~/utils/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const host =
    request.headers.get("X-Forwarded-Host") ?? request.headers.get("host");

  try {
    await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      fetch(`${new URL(request.url).protocol}${host}`, {
        method: "HEAD",
        headers: { "X-Healthcheck": "true" },
      }).then((r) => {
        if (!r.ok) return Promise.reject(r);
      }),
    ]);
    return new Response("OK");
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error(request.url, "healthcheck ❌", { error });
    return new Response("ERROR", { status: 500 });
  }
}
