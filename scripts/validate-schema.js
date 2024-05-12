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
    jsonId: { type: "string" },
    published: { type: "boolean" },
    modules: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          jsonId: { type: "string" },
          // published: { type: "boolean" },
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
                    required: ["title, jsonId"],
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
  required: ["title", "jsonId", "published", "modules"],
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
          console.error(validate.errors);
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
