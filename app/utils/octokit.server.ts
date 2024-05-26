import { Octokit } from "@octokit/rest";
import { BadRequestError, InternalServerError, NotFoundError } from "~/errors";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});
interface GCF {
  repo: string;
  path: string;
}

export async function getContentFromGithub({ repo, path }: GCF) {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: process.env.GITHUB_OWNER!,
      repo,
      path,
    });

    if (typeof data === "object" && "content" in data) {
      const content = Buffer.from(data.content, "base64").toString("utf-8");
      if (content.trim() === "") {
        throw new NotFoundError("Empty content.");
      }
      return { content };
    } else {
      throw new BadRequestError("Invalid content.");
    }
  } catch (error) {
    throw new InternalServerError();
  }
}
