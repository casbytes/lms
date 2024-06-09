import slugify from "slugify";
import { PrismaClient } from "@prisma/client";
import { readJsonFiles, parseJson } from "./utils.js";

const prisma = new PrismaClient();

/**
 * Course data
 * @param {*} data
 */
async function createOrUpdateCourse(data) {
  try {
    await prisma.$transaction(async (txn) => {
      await createCourse(txn, data);
    });
  } catch (error) {
    throw new Error("Error creating/updating course:" + error);
  }
}

/**
 * Create or update course in DB
 * @param {PrismaClient} txn
 * @param {Course} data
 * @returns {Promise<void>}
 */
async function createCourse(txn, data) {
  const { title, published, jsonId, modules } = data;

  const course = await txn.course.upsert({
    where: { jsonId },
    update: { title, slug: slugify(title, { lower: true }), published },
    create: { title, slug: slugify(title, { lower: true }), published, jsonId },
  });

  if (modules?.length) {
    await Promise.all(
      modules.map(async (moduleData) => {
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

        if (subModules?.length) {
          await Promise.all(
            subModules.map(async (subModuleData) => {
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

              if (lessons?.length) {
                await Promise.all(
                  lessons.map(async (lessonData) => {
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
