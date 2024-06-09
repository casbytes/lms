import fs from "node:fs";
import path from "node:path";

/**
 * Read and return array of json files
 * @returns {Array} - array of json files
 */
export function readJsonFiles() {
  const metaFolder = path.join(process.cwd() + "/meta");
  const files = fs
    .readdirSync(metaFolder)
    .filter((file) => file.endsWith(".json"))
    .map((file) => `${metaFolder}/${file}`);
  return files;
}

/**
 * Parse json files
 * @param {*} file - file to be passed
 * @returns {*}
 */
export function parseJson(file) {
  const data = fs.readFileSync(file, "utf-8");
  return JSON.parse(data);
}
