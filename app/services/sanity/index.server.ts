import { cache } from "~/utils/node-cache.server";
import { loadQuery } from "./loader.server";
import {
  ARTICLES_QUERY,
  COURSE_BY_ID_QUERY,
  COURSES_QUERY,
  MODULE_BY_ID_QUERY,
  MODULES_QUERY,
} from "./queries.server";
import { Article, MetaCourse, MetaModule, ReviewWithUser } from "./types";
import { checkCatalog } from "~/utils/helpers.server";
import { prisma } from "~/utils/db.server";

export async function getMetaCourses(userId?: string): Promise<MetaCourse[]> {
  const cacheKey = "meta-courses";
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) as MetaCourse[];
  }

  const { data: coursesData } = await loadQuery<MetaCourse[]>(COURSES_QUERY);

  // Fetch all reviews with course and user information
  const reviews = await prisma.reviews.findMany({
    where: { courseId: { not: null } },
    include: { course: true, user: true },
  });

  // Use a Map for better performance
  const reviewsMap = new Map<string, ReviewWithUser[]>();

  for (const review of reviews) {
    const courseTitle = review?.course?.title;
    if (courseTitle) {
      if (!reviewsMap.has(courseTitle)) {
        reviewsMap.set(courseTitle, []);
      }
      reviewsMap.get(courseTitle)!.push(review);
    }
  }

  const courses = await Promise.all(
    coursesData.map(async (course) => {
      const courseReviews = reviewsMap.get(course.title) || [];
      const inCatalog = userId
        ? !!(await checkCatalog({ courseTitle: course.title }))
        : false;

      return {
        ...course,
        reviews: courseReviews,
        inCatalog,
      };
    })
  );

  cache.set<MetaCourse[]>(cacheKey, courses);
  return courses;
}

export async function getMetaCourseById(id: string) {
  const cacheKey = `meta-course-${id}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) as MetaCourse;
  }
  const { data: course } = await loadQuery<MetaCourse>(COURSE_BY_ID_QUERY, {
    id,
  });

  cache.set<MetaCourse>(cacheKey, course);
  return course;
}

export async function getMetaModules({
  searchTerm,
  userId,
}: {
  searchTerm: string | null;
  userId?: string;
}): Promise<MetaModule[]> {
  const sanitizedSearchTerm = searchTerm?.trim() || "";
  const cacheKey = sanitizedSearchTerm
    ? `some-meta-modules-${sanitizedSearchTerm}`
    : "all-meta-modules";

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) as MetaModule[];
  }

  const { data: modulesData } = await loadQuery<MetaModule[]>(MODULES_QUERY);

  // Fetch all reviews with module and user information
  const reviews = await prisma.reviews.findMany({
    where: { moduleId: { not: null } },
    include: { module: true, user: true },
  });

  // Use a Map for better performance
  const reviewsMap = new Map<string, ReviewWithUser[]>();

  for (const review of reviews) {
    const moduleTitle = review?.module?.title;
    if (moduleTitle) {
      if (!reviewsMap.has(moduleTitle)) {
        reviewsMap.set(moduleTitle, []);
      }
      reviewsMap.get(moduleTitle)!.push(review);
    }
  }

  const modules = await Promise.all(
    modulesData.map(async (module) => {
      const moduleReviews = reviewsMap.get(module.title) || [];
      const inCatalog = userId
        ? !!(await checkCatalog({ moduleTitle: module.title }))
        : false;

      return {
        ...module,
        reviews: moduleReviews,
        inCatalog,
      };
    })
  );

  cache.set<MetaModule[]>(cacheKey, modules);

  if (sanitizedSearchTerm) {
    return modules.filter(
      (module) =>
        module.title
          .toLowerCase()
          .includes(sanitizedSearchTerm.toLowerCase()) ||
        module.tags
          .split(",")
          .some((tag) =>
            tag.trim().toLowerCase().includes(sanitizedSearchTerm.toLowerCase())
          )
    );
  }

  return modules;
}

export async function getMetaModuleById(id: string) {
  const cacheKey = `meta-module-${id}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) as MetaModule;
  }
  const { data: module } = await loadQuery<MetaModule>(MODULE_BY_ID_QUERY, {
    id,
  });

  cache.set<MetaModule>(cacheKey, module);
  return module;
}

export async function getArticles() {
  const { data } = await loadQuery<Article[]>(ARTICLES_QUERY);
  return data;
}

export async function getArticleAllArticleTags() {
  const { data } = await loadQuery<Article[]>(ARTICLES_QUERY);
  const tags = data.reduce((acc, article) => {
    const articleTags = article.tags.split(",");
    return [...acc, ...articleTags];
  }, [] as string[]);
  return Array.from(new Set(tags));
}
