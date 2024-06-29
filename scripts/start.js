import { spawn } from "node:child_process";
import * as ltfs from "litefs-js";

async function go() {
  const { getInstanceInfo } = ltfs;
  const { currentInstance, currentIsPrimary, primaryInstance } =
    await getInstanceInfo();

  if (currentIsPrimary) {
    console.info(
      `Instance (${currentInstance}) in ${process.env.FLY_REGION} is primary. Deploying migrations.`
    );
    /**
     * Apply  DB migrations if any
     */
    // await exec("npm run migrate:prod");
    // console.info("DB migrations applied!");

    /**
     * Validate JSON schema
     */
    console.info("Validating JSON schema...");
    await exec("npm run validate");
    console.info("JSON Schema validated!");

    /**
     * Update DB
     */
    console.info("Updating database...");
    await exec("npm run update:prod");
    console.info("Database updated!");
  } else {
    console.info(
      `Instance (${currentInstance}) in ${process.env.FLY_REGION} is not primary (the primary instance is ${primaryInstance}). Skipping migrations.`
    );
  }

  /**
   * Finally, start the app.
   */
  console.log("Starting server...");
  await exec("remix-serve ./build/server/index.js");
}
go();

/**
 * Executes a shell command
 * @param {String} command - Command to execute
 */
async function exec(command) {
  const child = spawn(command, { shell: true, stdio: "inherit" });
  await new Promise((resolve, reject) => {
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject();
      }
    });
  });
}
