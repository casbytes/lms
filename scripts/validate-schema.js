import fs from "node:fs";
import AJV from "ajv";
import { readJsonFiles } from "./utils.js";

const ajv = new AJV();

/**
 * JSON schema to validate JSON files
 */
const schema = {
  type: "object",
  properties: {
    title: { type: "string" },
    published: { type: "boolean" },
    jsonId: { type: "string" },
    modules: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          jsonId: { type: "string" },
          subModules: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                jsonId: { type: "string" },
                lessons: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      jsonId: { type: "string" },
                    },
                    required: ["title", "jsonId"],
                  },
                },
              },
              required: ["title", "jsonId", "lessons"],
            },
          },
        },
        required: ["title", "jsonId", "subModules"],
      },
    },
  },
  required: ["title", "published", "jsonId", "modules"],
};

/**
 * Validate JSON files against schema to ensure data integrity
 * @returns {Promise<void>}
 */
async function validate() {
  const files = readJsonFiles();

  for (const file of files) {
    try {
      fs.readFile(file, "utf8", (err, data) => {
        if (err) {
          console.error(err);
          process.exit(1);
        }

        const meta = JSON.parse(data);
        const validate = ajv.compile(schema);
        const isValid = validate(meta);

        if (!isValid) {
          console.error(`Invalid json schema: ${validate.errors}`);
          process.exit(1);
        }
      });
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }
}
validate();
