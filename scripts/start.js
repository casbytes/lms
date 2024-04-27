import fs from "fs";
import path from "path";
import os from "os";
import { spawn } from "child_process";
import * as ltfs from "litefs-js";

async function go() {
  const { getInstanceInfo } = ltfs;
  const { currentInstance, currentIsPrimary, primaryInstance } =
    await getInstanceInfo();
  if (currentIsPrimary) {
    console.log(
      `Instance (${currentInstance}) in ${process.env.FLY_REGION} is primary. Deploying migrations.`
    );
    await exec("npx prisma migrate deploy");
    console.log("Database migrations completed!");

    // await exec("npm run validate");
    // console.log("JSON Schema validated!");

    await exec("npm run update:db");
    console.log("Database updated!");
  } else {
    console.log(
      `Instance (${currentInstance}) in ${process.env.FLY_REGION} is not primary (the primary instance is ${primaryInstance}). Skipping migrations.`
    );
  }

  console.log("Starting server...");
  await exec("remix-serve ./build/server/index.js");
}
go();

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
