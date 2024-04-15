import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import matter from "gray-matter";
import { Container } from "~/components/container";
import { Markdown } from "~/components/markdown";
import { PageTitle } from "~/components/page-title";
import { readContent } from "~/utils/read-mdx-content.server";

export async function loader() {
  try {
    const content = await readContent("privacy-policy.mdx");
    const data = matter(content);
    return json(data);
  } catch (error) {
    throw error;
  }
}

export default function PrivacyPolicy() {
  const data = useLoaderData<typeof loader>();
  return (
    <Container className="bg-header-2 bg-no-repeat">
      <div className="mx-auto max-w-3xl">
        <PageTitle title="Privacy policy" className="text-lg mb-6" />
        <Markdown source={data.content} />
      </div>
    </Container>
  );
}
