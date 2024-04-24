import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import os from "os";

async function go() {
  await exec("npx prisma migrate deploy");
  console.log("Database migrations completed!");

  // await exec("npm run validate");
  // console.log("JSON Schema validated!");

  await exec("npm run update:db");
  console.log("Database updated!");

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
