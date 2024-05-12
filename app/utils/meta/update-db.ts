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

/**
 * For the test, checkpoint, and project sub-modules, when a user try to visit
 * them, they will be redirected to their various pages to carryout their
 * respective tasks.
 */

type OmitPrismaClientMethods<T> = Omit<
  T,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;
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
  try {
    await prisma.$transaction(async (txn) => {
      await createCourse(txn, data);
    });
  } catch (error) {
    throw new Error("Error creating/updating course:" + error);
  }
}

async function createCourse(
  txn: OmitPrismaClientMethods<PrismaClient>,
  data: ICourse
) {
  const { title, published, jsonId, modules } = data;

  const course = await txn.course.upsert({
    where: { jsonId },
    update: { title, slug: slugify(title, { lower: true }), published },
    create: { title, slug: slugify(title, { lower: true }), published, jsonId },
  });

  if (modules?.length > 0) {
    await Promise.all(
      modules.map(async (moduleData: IModule) => {
        const { title, jsonId, subModules } = moduleData;

        const module = await txn.module.upsert({
          where: { jsonId },
          update: { title, slug: slugify(title, { lower: true }) },
          create: {
            title,
            slug: slugify(title, { lower: true }),
            jsonId,
            courseId: course.id,
          },
        });

        if (subModules?.length > 0) {
          await Promise.all(
            subModules.map(async (subModuleData: ISubModule) => {
              const { title, jsonId, lessons } = subModuleData;

              const subModule = await txn.subModule.upsert({
                where: { jsonId },
                update: { title, slug: slugify(title, { lower: true }) },
                create: {
                  title,
                  slug: slugify(title, { lower: true }),
                  jsonId,
                  moduleId: module.id,
                },
              });

              if (lessons?.length > 0) {
                await Promise.all(
                  lessons.map(async (lessonData: ILesson) => {
                    const { title, jsonId } = lessonData;
                    await txn.lesson.upsert({
                      where: { jsonId },
                      update: { title, slug: slugify(title, { lower: true }) },
                      create: {
                        title,
                        slug: slugify(title, { lower: true }),
                        jsonId,
                        subModuleId: subModule.id,
                      },
                    });
                  })
                );
              }
            })
          );
        }
      })
    );
  }
  return course;
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
