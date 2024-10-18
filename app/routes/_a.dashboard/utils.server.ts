import invariant from "tiny-invariant";
import { prisma, type Course, type Module } from "~/utils/db.server";
import { getUserId } from "~/utils/session.server";
import { formatResponse } from "~/utils/helpers.server";

export interface TimeData {
  date: string;
  hours: number;
}

/**
 * Get learning data for a user
 * @param {Request} request - The incoming request
 * @param {TimeUnit} unit - The time unit
 * @param {number} length - The length
 * @returns {Promise<TimeData[]>} - The learning data
 */

export async function getLearningTime(
  request: Request,
): Promise<TimeData[]> {

  const userId = await getUserId(request);
  const learningTimes = await prisma.learningTime.findMany({
    where: { userId },
    orderBy: { date: "asc" },
  });

  return learningTimes.map((learningTime) => {
    return {
      date: learningTime.date.toISOString(),
      hours: learningTime.hours,
    };
  });
 
}

/**
 * Get user courses
 * @param {Request} request
 * @returns {Promise<ICourse[]>}
 */
export async function getUserCourses(request: Request): Promise<Course[]> {
  const userId = await getUserId(request);
  return prisma.course.findMany({
    where: { users: { some: { id: userId } } },
  });
}

/**
 * Get user modules
 * @param {Request} request - The incoming request
 * @returns {Promise<ICourse[]>} - The user modules
 */
export async function getUserModules(request: Request): Promise<Module[]> {
  const url = new URL(request.url);
  const search = url.searchParams.get("userModule") ?? "";
  const userId = await getUserId(request);
  return prisma.module.findMany({
    where: {
      OR: [{ title: { contains: search }, slug: { contains: search } }],
      users: { some: { id: userId } },
    },
    include: { course: true },
    orderBy: { order: "asc" },
  });
}

//##########
//ACTIONS
//##########
enum Actions {
  DELETE_MODULE = "deleteModule",
  DELETE_COURSE = "deleteCourse",
}
export async function handleActions(request: Request) {
  const { userId, itemId, intent } = await getFormData(request);
  invariant(intent, "Invalid form data.");

  switch (intent as Actions) {
    case Actions.DELETE_COURSE:
      return await deleteCourse(itemId, userId);

    case Actions.DELETE_MODULE:
      return await deleteModule(itemId, userId);

    default:
      throw new Error("Invalid intent.");
  }
}

async function getFormData(request: Request) {
  const formData = await request.formData();
  return {
    userId: await getUserId(request),
    itemId: formData.get("itemId") as string,
    intent: formData.get("intent") as Actions
  };
}

async function deleteCourse(courseId: string, userId: string) {
  try {
    const course = await prisma.course.delete({
      where: { id: courseId, users: { some: { id: userId } } },
      select: { title: true },
    });
    return formatResponse(true, `Removed '${course.title}' from catalog`);
  } catch (error) {
    return formatResponse(
      false,
      "An error occured while removing course from catalog, please try again."
    );
  }
}

async function deleteModule(moduleId: string, userId: string) {
  try {
    const module = await prisma.module.delete({
      where: { id: moduleId, users: { some: { id: userId } } },
      select: { title: true },
    });
    return formatResponse(true, `Removed '${module.title}' from catalog`);
  } catch (error) {
    return formatResponse(
      false,
      "An error occured while removing course from catalog, please try again."
    );
  }
}
