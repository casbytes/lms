import { json, useLoaderData } from "@remix-run/react";
import { Container } from "~/components/container";
import { Markdown } from "~/components/markdown";
import { PageTitle } from "~/components/page-title";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { readContent } from "~/utils/helpers.server";
import { metaFn } from "~/utils/meta";
import { cache } from "~/utils/node-cache.server";

export const meta = metaFn;

type FAQ = {
  data: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  content: string;
};

export async function loader() {
  const cacheKey = "faqs";
  if (cache.has(cacheKey)) {
    return json(cache.get<FAQ[]>(cacheKey));
  }
  const faqs = readContent("faqs");
  cache.set<FAQ[]>(cacheKey, faqs);
  return json(faqs);
}

export default function FAQS() {
  const faqs = useLoaderData<typeof loader>();

  return (
    <Container className="max-w-3xl">
      <PageTitle title="FAQs" />
      <Accordion type="single" collapsible className="w-full mt-8">
        {faqs.map((faq, index) => (
          <AccordionItem
            value={faq.data.question}
            key={faq.data.question}
            className="mb-2"
          >
            <AccordionTrigger className="text-lg font-bold">
              {index + 1}. {faq.data.question}
            </AccordionTrigger>
            <AccordionContent className="mt-2 px-4">
              <Markdown source={faq.content} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Container>
  );
}
