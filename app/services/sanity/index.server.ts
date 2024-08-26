import { cache } from "~/utils/node-cache.server";
import { loadQuery } from "./loader.server";
import {
  COURSE_BY_ID_QUERY,
  COURSES_QUERY,
  MODULE_BY_ID_QUERY,
  MODULES_QUERY,
} from "./queries.server";
import { MetaCourse, MetaModule } from "./types";

export async function getMetaCourses() {
  const checheKey = "meta-courses";
  if (cache.has(checheKey)) {
    return cache.get(checheKey) as MetaCourse[];
  }
  const { data: courses } = await loadQuery<MetaCourse[]>(COURSES_QUERY);

  cache.set<MetaCourse[]>(checheKey, courses);
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

export async function getMetaModules(
  searchTerm: string | null = null
): Promise<MetaModule[]> {
  const sanitizedSearchTerm = searchTerm?.trim() || "";
  const cacheKey = sanitizedSearchTerm
    ? `some-meta-modules-${sanitizedSearchTerm}`
    : "all-meta-modules";

  let modules: MetaModule[];
  if (cache.has(cacheKey)) {
    modules = cache.get(cacheKey) as MetaModule[];
  } else {
    const { data } = await loadQuery<MetaModule[]>(MODULES_QUERY);
    modules = data;
    cache.set<MetaModule[]>(cacheKey, modules);
  }

  if (sanitizedSearchTerm) {
    return modules.filter(
      (module) =>
        module.title
          .toLowerCase()
          .includes(sanitizedSearchTerm.toLowerCase()) ||
        module.slug.toLowerCase().includes(sanitizedSearchTerm.toLowerCase())
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
