import { Octokit } from "@octokit/rest";

export const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
interface GCFProps {
  repo: string;
  path: string;
}

/**
 * Fetches content from a specified GitHub repository and path.
 * 
 * @param {GCFProps} props - The properties object.
 * @param {string} props.repo - The name of the GitHub repository.
 * @param {string} props.path - The file path within the repository.
 * @returns {Promise<Record<string, string>>} A promise that resolves to an object containing the file content.
 * @throws {Error} If the content is empty or invalid, or if there's an error during the fetch operation.
 * 
 * @example
 * try {
 *   const { content } = await getContentFromGithub({
 *     repo: 'my-repo',
 *     path: 'path/to/file.md'
 *   });
 *   console.log(content);
 * } catch (error) {
 *   console.error('Error fetching content:', error);
 * }
 */

export async function getContentFromGithub({
  repo,
  path,
}: GCFProps): Promise<Record<string, string>> {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: process.env.GITHUB_OWNER,
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
