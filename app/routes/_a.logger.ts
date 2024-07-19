import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { startOfToday } from "date-fns";
import invariant from "tiny-invariant";
import { prisma } from "~/utils/db.server";
import { getUserId } from "~/utils/session.server";

export function loader() {
  return redirect("/");
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await getUserId(request);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const hours = formData.get("hours") as string;
  const today = startOfToday();
  invariant(intent === "log" && hours, "Invalid intent or hours");

  try {
    const existingLog = await prisma.learningTime.findFirst({
      where: { userId, date: today },
    });

    if (existingLog) {
      await prisma.learningTime.update({
        where: { id: existingLog.id },
        data: { hours: { increment: parseFloat(hours) } },
      });
    } else {
      await prisma.learningTime.create({
        data: { userId, date: today, hours: parseFloat(hours) },
      });
    }
    let count = 0;
    console.log(`${count++} Learning time logged: ${hours} hours`);
    return null;
  } catch (error) {
    throw error;
  }
}
