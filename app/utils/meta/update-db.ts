import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

/**
 * !QUESTION:
 * ? You may be asking why we are only creating and updating the course, modules, sub-modules, and lessons
 * ? and not deleting them if they are not present in the JSON file.
 *
 * !ANSWER:
 * ? This application is hosted on fly.io and this script is run when the application is ABOUT TO start
 * ? and we only want our course and it elements in the DB to only be created or updated on-before-start.
 * ? This app also uses SQLite in production, in the Dockerfile, there is a script that execute the fly ssh
 * ? into the database_cli so that we can directly have access to the database and run queries directly.
 */

interface ICourse {
  jsonId: string;
  title: string;
  slug: string;
  published: boolean;
  modules: IModule[];
}

interface IModule {
  jsonId: string;
  title: string;
  slug: string;
  // published: boolean;
  subModules: ISubModule[];
}

interface ISubModule {
  jsonId: string;
  title: string;
  slug: string;
  lessons: ILesson[];
}

interface ILesson {
  jsonId: string;
  title: string;
  slug: string;
}

export function readJsonFiles(): string[] {
  const metaFolder = path.join(process.cwd(), "meta");
  const files = fs
    .readdirSync(metaFolder)
    .filter((file) => file.endsWith(".json"))
    .map((file) => `${metaFolder}/${file}`);
  return files;
}

export function parseJson(file: string) {
  const data = fs.readFileSync(file, "utf-8");
  return JSON.parse(data);
}

async function createOrUpdateCourse(data: ICourse): Promise<void> {
  const { jsonId, title, published, modules } = data;

  try {
    /**
     * Create or update the course and its elements in a transaction
     * to ensure data integrity
     */
    await prisma.$transaction(async (txn) => {
      /**
       * Create or update the course
       * Upsert is used to create a new course if it doesn't exist
       */
      const course = await txn.course.upsert({
        where: { jsonId },
        update: { title, published, slug: slugify(title, { lower: true }) },
        create: {
          jsonId,
          title,
          slug: slugify(title, { lower: true }),
          published,
        },
      });

      /**
       * Create or update the modules, sub-modules, and lessons
       */
      for (const moduleData of modules) {
        const { title, jsonId, subModules } = moduleData;
        const module = await txn.module.upsert({
          where: { jsonId },
          update: {
            title,
            slug: slugify(title, { lower: true }),
            // published
          },
          create: {
            jsonId,
            title,
            slug: slugify(title, { lower: true }),
            // published,
            courseId: course.id,
          },
        });

        /**
         * Create or update the sub-modules and lessons
         */
        for (const subModuleData of subModules) {
          const { title, jsonId, lessons } = subModuleData;
          const subModule = await txn.subModule.upsert({
            where: { jsonId },
            update: { title, slug: slugify(title, { lower: true }) },
            create: {
              jsonId,
              title,
              slug: slugify(title, { lower: true }),
              moduleId: module.id,
            },
          });

          /**
           * Create or update the lessons
           */
          for (const lessonData of lessons) {
            const { title, jsonId } = lessonData;
            await txn.lesson.upsert({
              where: { jsonId },
              update: { title, slug: slugify(title, { lower: true }) },
              create: {
                jsonId,
                title,
                slug: slugify(title, { lower: true }),
                subModuleId: subModule.id,
              },
            });
          }
        }
      }
    });
  } catch (error) {
    console.error("Error creating/updating course:", error);
    process.exit(1);
  }
}

/**
 * Main function for updating the database
 */
async function main() {
  /**
   * Read all JSON files in the meta folder
   */
  const files = readJsonFiles();

  /**
   * Parse each file and create/update the course in the database
   */
  for (const file of files) {
    const courseData = parseJson(file);
    try {
      await createOrUpdateCourse(courseData);
      console.log(
        `Course "${courseData.title}" and its elements created/updated successfully!`
      );
    } catch (error) {
      console.error(
        "Error creating/updating course or parsing json file:",
        error
      );
      process.exit(1);
    }
  }
}

/**
 * Run the main function and disconnect the Prisma client
 */
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
