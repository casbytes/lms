import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import matter from "gray-matter";
import { Container } from "~/components/container";
import { Markdown } from "~/components/markdown";
import { PageTitle } from "~/components/page-title";
import { readContent } from "~/utils/read-mdx-content.server";

export async function loader() {
  try {
    const mdx = await readContent("terms-of-use.mdx");
    const { content } = matter(mdx);
    return json(content);
  } catch (error) {
    throw new Error("Failed to load terms of use content, please try again.");
  }
}

export default function TermsOfUse() {
  const content = useLoaderData<typeof loader>();
  return (
    <Container className="bg-header-2 bg-no-repeat">
      <div className="mx-auto max-w-3xl">
        <PageTitle title="Terms of use" className="text-lg mb-6" />
        <Markdown source={content} />
      </div>
    </Container>
  );
}
