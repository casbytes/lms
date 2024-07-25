import matter from "gray-matter";
import fs from "node:fs";
import path from "node:path";

/**
 * Reads the content of file from the path
 * @param path - string
 * @returns {Promise<string>}
 */
export function readPage(pagePath: string): Promise<string> {
  const filePath = path.join(process.cwd(), "content/pages", pagePath);
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
 * Reads the content of folder
 * @param folder - string
 * @returns {Array<{data: Record<string, string>, content: string}>}
 */
export function readContent(folder: string) {
  const dir = path.join(process.cwd(), `content/${folder}`);
  const files = fs.readdirSync(dir);
  return files
    .map((file) => {
      const fileContent = fs.readFileSync(path.join(dir, file), "utf-8");
      const { data, content } = matter(fileContent);
      return { data, content };
    })
    .filter(Boolean);
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
