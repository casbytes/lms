import { Container } from "~/components/container";
import { metaFn } from "~/utils/meta";
import { json } from "@remix-run/node";
import { cache } from "~/utils/node-cache.server";
import { useLoaderData } from "@remix-run/react";
import { PageTitle } from "~/components/page-title";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Markdown } from "~/components/markdown";
import { readContent } from "~/utils/helpers.server";
import { MDX } from "~/utils/db.server";

export const meta = metaFn;

export async function loader() {
  const cacheKey = "courses-meta";
  if (cache.has(cacheKey)) {
    return json(cache.get(cacheKey) as MDX[]);
  }
  const courses = readContent("courses");
  cache.set<MDX[]>(cacheKey, courses);
  return json(courses);
}

export default function CoursesRoute() {
  const courses = useLoaderData<typeof loader>();
  return (
    <Container className="max-w-3xl">
      <PageTitle title="Courses" />
      <Accordion type="single" collapsible className="w-full mt-8">
        {courses.map((course) => (
          <AccordionItem
            value={course.data.title}
            key={course.data.title}
            className="mb-2"
          >
            <AccordionTrigger className="text-lg font-bold">
              {course.data.title}
            </AccordionTrigger>
            <AccordionContent className="mt-2">
              <p className="text-slate-600">{course.data.description}</p>
              <h2 className="my-2 text-lg">Modules</h2>
              <Markdown source={course.content} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Container>
  );
}
