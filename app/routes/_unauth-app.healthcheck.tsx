import { json } from "@remix-run/node";
import { prisma } from "~/libs/prisma";

export async function action() {
  try {
    const course = await prisma.course.findFirst();
    console.log(course);
    return json({ course }, 200);
  } catch (error) {
    console.error(error);
    throw new Error("Internal Server Error");
  }
}
