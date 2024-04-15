import fs from "node:fs";
import { join } from "node:path";

export function readContent(path: string): Promise<string> {
  const filePath = join(process.cwd(), "content/pages", path);
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}
