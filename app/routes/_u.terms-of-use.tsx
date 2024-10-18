import matter from "gray-matter";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Container } from "~/components/container";
import { Markdown } from "~/components/markdown";
import { PageTitle } from "~/components/page-title";
import { readPage } from "~/utils/helpers.server";
import { metaFn } from "~/utils/meta";

export const meta = metaFn;

export async function loader() {
  try {
    return json(matter(await readPage("terms-of-use.mdx")).content);
  } catch (error) {
    throw error;
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
