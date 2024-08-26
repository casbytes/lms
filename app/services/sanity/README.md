# Sanity API Documentation

This documentation provides an overview of the functions used to fetch and cache metadata for courses and modules in your application. The functions utilize a caching mechanism to reduce redundant queries and improve performance. The data is retrieved from a backend service using predefined GraphQL queries.

## Functions

### 1. `getMetaCourses`

#### Description

Fetches the metadata for all courses. This function first checks the cache for existing data and returns it if available. If not, it performs a query to fetch the data, caches the result, and then returns it.

#### Returns

- **MetaCourse[]**: An array of course metadata.

#### Usage

```typescript
import { getMetaCourses } from "~/sanity/index.server";

const courses = await getMetaCourses();
```

### 2. `getMetaCourseById`

#### Description

Fetches the metadata for a specific course by its ID. Similar to `getMetaCourses`, this function checks the cache first. If the course metadata is not cached, it queries the data, caches it, and then returns it.

#### Parameters

- **id** (`string`): The ID of the course to fetch.

#### Returns

- **MetaCourse**: Metadata for the specified course.

#### Usage

```typescript
import { getMetaCourseById } from "~/sanity/index.server";

const course = await getMetaCourseById("course-id");
```

### 3. `getMetaModules`

#### Description

Fetches metadata for all modules or searches for specific modules based on a search term. If a search term is provided, it filters the modules by title or slug. The function uses a cache to store results, reducing the need for repeated queries.

#### Parameters

- **searchTerm** (`string | null`, optional): A string used to search and filter the modules. If `null`, all modules are returned.

#### Returns

- **MetaModule[]**: An array of module metadata.

#### Usage

```typescript
import { getMetaModules } from "~/sanity/index.server";

// Fetch all modules
const modules = await getMetaModules();

// Search for specific modules
const filteredModules = await getMetaModules("css");
```

### 4. `getMetaModuleById`

#### Description

Fetches the metadata for a specific module by its ID. This function checks the cache for existing data before querying the backend service. If the module data is not found in the cache, it retrieves and caches the data, then returns it.

#### Parameters

- **id** (`string`): The ID of the module to fetch.

#### Returns

- **MetaModule**: Metadata for the specified module.

#### Usage

```typescript
import { getMetaModuleById } from "~/sanity/index.server";

const module = await getMetaModuleById("module-id");
```

## Caching Mechanism

The functions use a caching utility (`node-cache.server`) to store results in memory. This reduces the number of times the application needs to query the backend, improving performance.

### Example of Cache Usage

For example, when you call `getMetaCourses`, the function checks if the courses are already cached under the key `meta-courses`. If found, it returns the cached data. If not, it queries the backend, caches the result under the same key, and returns it.

```typescript
const checheKey = "meta-courses";
if (cache.has(checheKey)) {
  return cache.get(checheKey) as MetaCourse[];
}
```

## GROQ Queries

This document provides an overview of the GROQ queries used in your application to fetch data related to courses and modules from a Sanity CMS. These queries retrieve structured data, including course details, modules, sub-modules, and lessons.

## Queries

### 1. `COURSES_QUERY`

#### Description

This query fetches all published courses from the Sanity CMS. Each course includes its modules, sub-modules, and lessons. The data is structured to provide a nested hierarchy of courses, where each course contains multiple modules, each module contains multiple sub-modules, and each sub-module contains multiple lessons.

#### Query Structure

```groq
*[_type=="course" && published==true]{
  "id":_id,
  title,
  "slug":slug.current,
  published,
  testEnvironment,
  "modules": module[]->{
    "id":_id,
    title,
    "slug":slug.current,
    checkpoint,
    testEnvironment,
    "subModules": subModule[]->{
      "id":_id,
      title,
      "slug":slug.current,
      checkpoint,
      testEnvironment,
      "lessons": lesson[]->{
        "id":_id,
        title,
        "slug":slug.current,
      }
    }
  }
}
```

#### Returned Fields

- **id**: Unique identifier for the course.
- **title**: The title of the course.
- **slug**: The URL-friendly version of the course title.
- **published**: Boolean indicating if the course is published.
- **testEnvironment**: Specifies the test environment associated with the course.
- **modules**: An array of modules associated with the course.
  - **subModules**: An array of sub-modules within each module.
    - **lessons**: An array of lessons within each sub-module.

#### Usage

This query is useful for fetching a list of all published courses along with their complete module structure.

### 2. `COURSE_BY_ID_QUERY`

#### Description

Fetches a specific course by its ID. This query retrieves detailed information about the course, including its modules, sub-modules, and lessons. The structure is similar to `COURSES_QUERY` but is focused on a single course.

#### Query Structure

```groq
*[_type=="course" && _id==$id][0]{
  "id":_id,
  title,
  "slug":slug.current,
  testEnvironment,
  "modules": module[]->{
    "id":_id,
    title,
    "slug":slug.current,
    checkpoint,
    testEnvironment,
    "subModules": subModule[]->{
      "id":_id,
      title,
      "slug":slug.current,
      checkpoint,
      testEnvironment,
      "lessons": lesson[]->{
        "id":_id,
        title,
        "slug":slug.current,
      }
    }
  }
}
```

#### Parameters

- **id** (`string`): The ID of the course to fetch.

#### Returned Fields

- **id**: Unique identifier for the course.
- **title**: The title of the course.
- **slug**: The URL-friendly version of the course title.
- **testEnvironment**: Specifies the test environment associated with the course.
- **modules**: An array of modules associated with the course.
  - **subModules**: An array of sub-modules within each module.
    - **lessons**: An array of lessons within each sub-module.

#### Usage

This query is used to fetch detailed information about a specific course by its unique identifier.

### 3. `MODULES_QUERY`

#### Description

This query fetches all modules from the Sanity CMS, ordered by their title in ascending order. Each module includes its sub-modules and lessons.

#### Query Structure

```groq
*[_type == "module"] | order(title asc){
  "id": _id,
  title,
  "slug": slug.current,
  checkpoint,
  testEnvironment,
  "subModules": subModules[]->{
    "id": _id,
    title,
    "slug": slug.current,
    checkpoint,
    testEnvironment,
    "lessons": lessons[]->{
      "id": _id,
      title,
      "slug": slug.current
    }
  }
}
```

#### Returned Fields

- **id**: Unique identifier for the module.
- **title**: The title of the module.
- **slug**: The URL-friendly version of the module title.
- **checkpoint**: Specifies the checkpoint associated with the module.
- **testEnvironment**: Specifies the test environment associated with the module.
- **subModules**: An array of sub-modules within the module.
  - **lessons**: An array of lessons within each sub-module.

#### Usage

This query is used to retrieve all available modules, with their associated sub-modules and lessons, in alphabetical order by title.

### 4. `MODULE_BY_ID_QUERY`

#### Description

Fetches a specific module by its ID. The query retrieves detailed information about the module, including its sub-modules and lessons.

#### Query Structure

```groq
*[_type=="module" && _id==$id][0]{
  "id":_id,
  title,
  "slug":slug.current,
  checkpoint,
  testEnvironment,
  "subModules": subModule[]->{
    "id":_id,
    title,
    "slug":slug.current,
    checkpoint,
    testEnvironment,
    "lessons": lesson[]->{
      "id":_id,
      title,
      "slug":slug.current,
    }
  }
}
```

#### Parameters

- **id** (`string`): The ID of the module to fetch.

#### Returned Fields

- **id**: Unique identifier for the module.
- **title**: The title of the module.
- **slug**: The URL-friendly version of the module title.
- **checkpoint**: Specifies the checkpoint associated with the module.
- **testEnvironment**: Specifies the test environment associated with the module.
- **subModules**: An array of sub-modules within the module.
  - **lessons**: An array of lessons within each sub-module.

#### Usage

This query is used to fetch detailed information about a specific module by its unique identifier.
