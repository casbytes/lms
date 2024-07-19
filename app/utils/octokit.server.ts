import { Octokit } from "@octokit/rest";
import { remember } from "@epic-web/remember";

export const octokit = remember(
  "octokit",
  () => new Octokit({ auth: process.env.GITHUB_TOKEN })
);
interface GCFProps {
  repo: string;
  path: string;
}

/**
 * Fetch lesson content from Github using Octokit.
 * @param {String} repo - Github repository name
 * @param {String} path - Path to the file in the repository
 * @returns {String} - content
 */
export async function getContentFromGithub({
  repo,
  path,
}: GCFProps): Promise<Record<string, string>> {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: process.env.GITHUB_OWNER!,
      repo,
      path,
    });

    if (typeof data === "object" && "content" in data) {
      const content = Buffer.from(data.content, "base64").toString("utf-8");
      if (content.trim() === "") {
        throw new Error("Cannot fetch empty lesson content.");
      }
      return { content };
    } else {
      throw new Error("Invalid lesson content.");
    }
  } catch (error) {
    throw error;
  }
}
