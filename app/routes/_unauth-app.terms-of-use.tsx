import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import matter from "gray-matter";
import { Container } from "~/components/container";
import { Markdown } from "~/components/markdown";
import { PageTitle } from "~/components/page-title";
import { readContent } from "~/utils/read-mdx-content.server";

export async function loader() {
  try {
    const content = await readContent("terms-of-use.mdx");
    const data = matter(content);
    return json(data);
  } catch (error) {
    throw error;
  }
}

export default function TermsOfUse() {
  const data = useLoaderData<typeof loader>();

  const progress = 20;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (progress / 100) * circumference;
  return (
    <Container className="bg-header-2 bg-no-repeat">
      <div className="mx-auto max-w-3xl">
        <PageTitle title="Terms of use" className="text-lg mb-6" />
        <Markdown source={data.content} />
      </div>
    </Container>
  );
}
