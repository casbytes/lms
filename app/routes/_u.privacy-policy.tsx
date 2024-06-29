import matter from "gray-matter";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Container } from "~/components/container";
import { Markdown } from "~/components/markdown";
import { PageTitle } from "~/components/page-title";
import { readContent } from "~/utils/helpers.server";

export async function loader() {
  try {
    const mdx = await readContent("privacy-policy.mdx");
    const { content } = matter(mdx);
    return json(content);
  } catch (error) {
    throw new Error("Failed to load privacy policy content, please try again.");
  }
}

export default function PrivacyPolicy() {
  const content = useLoaderData<typeof loader>();
  return (
    <Container className="bg-header-2 bg-no-repeat">
      <div className="mx-auto max-w-3xl">
        <PageTitle title="Privacy policy" className="text-lg mb-6" />
        <Markdown source={content} />
      </div>
    </Container>
  );
}
