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
import { Badge } from "~/components/ui/badge";
import { readContent } from "~/utils/helpers.server";

export const meta = metaFn;

type Course = {
  data: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  content: string;
};

export async function loader() {
  const cacheKey = "courses-meta";
  if (cache.has(cacheKey)) {
    return json(cache.get<Course[]>(cacheKey));
  }
  const courses = readContent("courses");
  cache.set<Course[]>(cacheKey, courses);
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
            className="mb-4"
          >
            <AccordionTrigger className="text-lg font-bold">
              {course.data.title}
            </AccordionTrigger>
            <AccordionContent className="mt-2 px-4">
              <p className="text-slate-600">{course.data.description}</p>
              <Badge className="my-4">Modules</Badge>
              <Markdown source={course.content} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Container>
  );
}
