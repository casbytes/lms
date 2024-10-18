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
import { MDX } from "~/utils/db.server";
import { readContent } from "~/utils/helpers.server";
import { metaFn } from "~/utils/meta";
import { Redis as Cache } from "~/utils/redis.server";

type EMDX = MDX & { id: number };

export const meta = metaFn;

export async function loader() {
  const cacheKey = "faqs";
  const cachedFaqs = await Cache.get<EMDX[]>(cacheKey);
  if (cachedFaqs) {
    return json(cachedFaqs);
  }
  const faqs = readContent(cacheKey) as EMDX[];
  await Cache.set<EMDX[]>(cacheKey, faqs);
  return json(faqs);
}

export default function FAQS() {
  const faqs = useLoaderData<typeof loader>();
  return (
    <Container className="max-w-3xl">
      <PageTitle title="Frequently asked questions" />
      <Accordion type="single" collapsible className="w-full mt-8">
        {faqs
          .sort((a, b) => a.data.id - b.data.id)
          .map((faq, index) => (
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
