import fs from "node:fs";
import { join } from "node:path";

/**
 * Reads the content of file from the path
 * @param path - string
 * @returns {Promise<string>}
 */
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

/**
 * Get video source
 * @returns {string} - video source
 */
export function getVideoSource() {
  const { IFRAME_URL: iframeUrl, VIDEO_LIBRARY_ID: libraryId } =
    process.env as Record<string, string>;
  return `${iframeUrl}/embed/${Number(libraryId)}`;
}
