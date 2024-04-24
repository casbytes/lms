import { Octokit } from "@octokit/rest";
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});
export async function getContentFromGithub({
  repo,
  path,
}: {
  repo: string;
  path: string;
}) {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: process.env.GITHUB_OWNER!,
      repo,
      path,
    });

    if (typeof data === "object" && "content" in data) {
      const content = Buffer.from(data.content, "base64").toString("utf-8");
      if (content.trim() === "") {
        throw new Error("Content is empty.");
      }
      return { content };
    } else {
      throw new Error("Invalid response format.");
    }
  } catch (error) {
    console.error("Error fetching content:", error);
    throw new Error(
      "An error occured while fetching content. Please try again."
    );
  }
}
