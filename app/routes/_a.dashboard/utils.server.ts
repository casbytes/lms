import invariant from "tiny-invariant";
import { prisma, type Course, type Module } from "~/utils/db.server";
import { getUserId } from "~/utils/session.server";
import { cache } from "~/utils/node-cache.server";
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { formatResponse } from "~/utils/helpers.server";

const today = startOfDay(new Date());

type TimeUnit = "days" | "weeks" | "months";
interface TimeRange {
  start: Date;
  end: Date;
}
export interface TimeData {
  date: string;
  hours: number;
}

/**
 * Generate date ranges for a given time unit and length
 * @param {TimeUnit} unit - The time unit
 * @param {number} length - The length
 * @returns {TimeRange[]} - The date ranges
 */
function generateDateRanges(unit: TimeUnit, length: number): TimeRange[] {
  const ranges: TimeRange[] = [];

  for (let i = 0; i < length; i++) {
    let start: Date;
    let end: Date;

    switch (unit) {
      case "days":
        start = subDays(startOfDay(today), i);
        end = startOfDay(start);
        break;
      case "weeks":
        start = subWeeks(startOfWeek(today), i);
        end = endOfWeek(start);
        break;
      case "months":
        start = subMonths(startOfMonth(today), i);
        end = endOfMonth(start);
        break;
    }
    ranges.push({ start, end });
  }
  return ranges.reverse();
}

/**
 * Get learning data for a user
 * @param {Request} request - The incoming request
 * @param {TimeUnit} unit - The time unit
 * @param {number} length - The length
 * @returns {Promise<TimeData[]>} - The learning data
 */
async function getLearningData(
  request: Request,
  unit: TimeUnit,
  length: number
): Promise<TimeData[]> {
  const userId = await getUserId(request);
  const ranges = generateDateRanges(unit, length);
  const dateCondition = {
    days: subDays(today, 7),
    weeks: subWeeks(startOfWeek(today), 7),
    months: subMonths(startOfMonth(today), 6),
  }[unit];

  const learningTimes = await prisma.learningTime.findMany({
    where: { userId, date: { gte: dateCondition } },
    orderBy: { date: "asc" },
  });

  return ranges.map(({ start, end }) => {
    const totalHours = learningTimes
      .filter((lh) => lh.date >= start && lh.date <= end)
      .reduce((sum, { hours }) => sum + hours, 0);

    const formattedDate = {
      days: format(start, "MMM d"),
      weeks: `${format(start, "MMM d")}-${format(end, "MMM d")}`,
      months: format(start, "MMM yyyy"),
    }[unit];

    return { date: formattedDate, hours: totalHours };
  });
}

/**
 * Get user learning time from the cache or database
 * @param {Request} request - The incoming request
 * @returns {Promise<TimeData[]>} - The learning time
 */
export async function getLearningTime(request: Request): Promise<TimeData[]> {
  const url = new URL(request.url);
  const filter = (url.searchParams.get("filter") as TimeUnit) ?? "days";
  const cacheKey = `learningTime-${filter}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) as TimeData[];
  }

  const result = await getLearningData(
    request,
    filter,
    { days: 7, weeks: 8, months: 6 }[filter]
  );
  cache.set<TimeData[]>(cacheKey, result, 5000);
  return result;
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
export async function handleActions(request: Request) {
  const { userId, itemId, intent } = await getFormData(request);
  invariant(intent, "Invalid form data.");

  switch (intent) {
    case "deleteCourse":
      return await deleteCourse(itemId, userId);

    case "deleteModule":
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
    intent: formData.get("intent") as "deleteCourse" | "deleteModule",
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
