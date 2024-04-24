import fs from "fs";
import path from "path";

export function readJsonFiles() {
  const metaFolder = path.join(process.cwd() + "/meta");
  const files = fs
    .readdirSync(metaFolder)
    .filter((file) => file.endsWith(".json"))
    .map((file) => `${metaFolder}/${file}`);
  return files;
}

export function parseJson(file) {
  const data = fs.readFileSync(file, "utf-8");
  return JSON.parse(data);
}
