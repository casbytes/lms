import slugify from "slugify";
import { Octokit } from "@octokit/rest";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const octokitCredentials = {
  owner: "casbytes",
  repo: "meta",
  path: "build",
};

/**
 * Create or update course in DB
 * @param {PrismaClient} txn
 * @param {Course} data
 * @returns {Promise<void>}
 */
async function createCourse(txn, data) {
  const { title, published, id: jsonId, modules } = data;

  const course = await txn.course.upsert({
    where: { jsonId },
    update: { title, slug: slugify(title, { lower: true }), published },
    create: {
      title,
      slug: slugify(title, { lower: true }),
      published,
      jsonId,
    },
  });

  if (modules?.length) {
    await Promise.all(
      modules.map(async (moduleData) => {
        const { title, id: jsonId, subModules } = moduleData;

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
              const { title, id: jsonId, lessons } = subModuleData;
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
                    const { title, id: jsonId } = lessonData;
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
 * Main function for updating the database
 */
async function main() {
  try {
    const { data: courses } = await octokit.repos.getContent(
      octokitCredentials
    );
    for (const course of courses) {
      const { data: fileData } = await octokit.repos.getContent({
        ...octokitCredentials,
        path: `build/${course.name}`,
      });

      // eslint-disable-next-line no-undef
      const jsonContent = Buffer.from(fileData.content, "base64").toString(
        "utf8"
      );
      const courseContent = JSON.parse(jsonContent);
      await createOrUpdateCourse(courseContent);
      console.info(
        `Course "${courseContent.title}" and its elements created/updated successfully!`
      );
    }
  } catch (error) {
    console.error(
      "Error creating/updating course or parsing json file:",
      error
    );
    process.exit(1);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
