import { Redis as Cache } from "~/utils/redis.server";
import { loadQuery } from "./loader.server";
import {
  ARTICLE_QUERY,
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
  const cachedMetaCourses = (await Cache.get(cacheKey)) as MetaCourse[] | null;
  if (cachedMetaCourses) {
    return cachedMetaCourses;
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

  await Cache.set<MetaCourse[]>(cacheKey, courses);
  return courses;
}

export async function getMetaCourseById(id: string) {
  const cacheKey = `meta-course-${id}`;
  const cachedMetaCourse = (await Cache.get(cacheKey)) as MetaCourse | null;
  if (cachedMetaCourse) {
    return cachedMetaCourse;
  }
  const { data: course } = await loadQuery<MetaCourse>(COURSE_BY_ID_QUERY, {
    id,
  });

  await Cache.set<MetaCourse>(cacheKey, course);
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

  function filterModules(modules: MetaModule[], searchTerm: string) {
    return modules.filter(
      (module) =>
        module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.tags.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const cachedMetaModules = (await Cache.get(cacheKey)) as MetaModule[] | null;
  if (cachedMetaModules) {
    return filterModules(cachedMetaModules, sanitizedSearchTerm);
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

  await Cache.set<MetaModule[]>(cacheKey, modules, { EX: 3600 });
  if (sanitizedSearchTerm) {
    return filterModules(modules, sanitizedSearchTerm);
  }
  return modules;
}

export async function getMetaModuleById(id: string) {
  const cacheKey = `meta-module-${id}`;
  try {
    const cachedMetaModule = (await Cache.get(cacheKey)) as MetaModule | null;
    if (cachedMetaModule) {
      return cachedMetaModule;
    }
    const { data: module } = await loadQuery<MetaModule>(MODULE_BY_ID_QUERY, {
      id,
    });

    await Cache.set<MetaModule>(cacheKey, module);
    return module;
  } catch (error) {
    throw error;
  }
}

export async function getArticles(
  searchTerm?: string,
  articleCount?: number
): Promise<Article[]> {
  const cacheKey = searchTerm
    ? `articles:${searchTerm}`
    : `articles:${articleCount}`;

  try {
    const cachedArticles = (await Cache.get(cacheKey)) as Article[] | null;
    if (cachedArticles) {
      return cachedArticles;
    }

    const { data } = await loadQuery<Article[]>(ARTICLES_QUERY);
    const articles = articleCount ? data.slice(0, articleCount) : data;

    if (!searchTerm) {
      await Cache.set(cacheKey, articles, { EX: 3600 });
      return articles;
    }

    const filteredArticles = articles.filter(
      (article) =>
        article.title.includes(searchTerm) ||
        article.content.includes(searchTerm) ||
        article.tags.includes(searchTerm)
    );
    await Cache.set(cacheKey, filteredArticles, { EX: 3600 });
    return filteredArticles;
  } catch (error) {
    throw error;
  }
}

export async function getArticle(slug: string): Promise<Article> {
  try {
    const cacheKey = `article:${slug}`;
    const cachedArticle = (await Cache.get(cacheKey)) as Article | null;
    if (cachedArticle) {
      return cachedArticle;
    }
    const { data } = await loadQuery<Article>(ARTICLE_QUERY, { slug });
    await Cache.set<Article>(cacheKey, data, { EX: 3600 });
    return { ...data, realtedArticles: await getRelatedArticles(data) };
  } catch (error) {
    throw error;
  }
}

async function getRelatedArticles(article: Article) {
  const cacheKey = `related-articles:${article.slug}`;
  try {
    const cachedArticles = (await Cache.get(cacheKey)) as Article[] | null;
    if (cachedArticles) {
      return cachedArticles;
    }
    const tags = article.tags.split(",");
    const { data } = await loadQuery<Article[]>(ARTICLES_QUERY);
    const relatedArticles = data
      .filter((a) => {
        const aTags = a.tags.split(",");
        return (
          aTags.some((tag) => tags.includes(tag)) && a.slug !== article.slug
        );
      })
      .slice(0, 4);
    await Cache.set(cacheKey, relatedArticles, { EX: 3600 });
    return relatedArticles;
  } catch (error) {
    throw error;
  }
}

export async function getArticleAllArticleTags() {
  const cacheKey = "article-tags";
  try {
    const cachedTags = (await Cache.get(cacheKey)) as string[] | null;
    if (cachedTags) {
      return cachedTags;
    }
    const { data } = await loadQuery<Article[]>(ARTICLES_QUERY);
    const tags = data.reduce((acc, article) => {
      const articleTags = article.tags.split(",");
      return [...acc, ...articleTags];
    }, [] as string[]);
    return await Cache.set<string[]>(cacheKey, Array.from(new Set(tags)), {
      EX: 3600,
    });
  } catch (error) {
    throw error;
  }
}
