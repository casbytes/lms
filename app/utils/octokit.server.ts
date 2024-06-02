import { Octokit } from "@octokit/rest";
import { BadRequestError, InternalServerError, NotFoundError } from "~/errors";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});
interface GCFProps {
  repo: string;
  path: string;
}

/**
 * Fetch lesson content from Github using Octokit.
 * @param {String} repo
 * @param {String} path
 * @returns {String} content
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
        throw new NotFoundError("Cannot fetch empty lesson content.");
      }
      return { content };
    } else {
      throw new BadRequestError("Invalid content.");
    }
  } catch (error) {
    throw new InternalServerError(
      "An error occured while fetching lesson content. Please try again."
    );
  }
}
