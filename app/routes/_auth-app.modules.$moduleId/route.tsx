import { BackButton } from "~/components/back-button";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { useLoaderData, useRouteError } from "@remix-run/react";
import { Markdown } from "~/components/markdown";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { SheetContent } from "~/components/ui/sheet";
import { ErrorUI } from "~/components/error-ui";
import { ModuleSideContent } from "./components/module-side-content";
import Pagination from "./components/pagination";
import { Iframe } from "~/components/iframe";

export async function loader() {
  const content = `
  some paragraph
  ![e learning](/logo.png)
  [Home](/)
  https://casbytes.b-cdn.net/icon.svg
  In the Nigerian Institute of Quantity Surveyors (NIQS), members are categorized into different classes based on their qualifications, experience, and contributions to the profession. Here is a general ranking of the membership classes:

**Probationer**: This is the entry-level category for individuals who have completed their academic requirements in quantity surveying and are undergoing practical training or probation.

![](https://casbytes.b-cdn.net/icon.jpg)
**Associate Member**: After completing the probationary period and meeting certain criteria, probationers can become Associate Members. They have demonstrated a level of competence in quantity surveying but may still be gaining further experience.

3.  **Member**: This is a senior level of membership for individuals who have gained sufficient experience and have demonstrated a high level of competence in quantity surveying. Members have typically completed additional professional development requirements.
\`console.log("inline")\`
4.  **Fellow**: Fellowship is the highest level of membership in NIQS and is awarded to individuals who have made significant contributions to the field of quantity surveying, have demonstrated leadership, and have a distinguished record of service to the profession.

The ranking from lowest to highest would be Probationer, Associate Member, Member, and Fellow. Each category has specific criteria and requirements for admission, advancement, and retention.

  ::: info
  testing info
  testing info
  testing info
  testing info
  testing info testing info
  testing info
  testing info
  testing info
  testing info testing info
  testing info
  testing info
  testing info
  testing info testing info
  testing info
  testing info
  testing info
  testing info testing info
  testing info
  testing info
  testing info
  testing info testing info
  testing info
  testing info
  testing info
  testing info testing info
  testing info
  testing info
  testing info
  testing info testing info
  testing info
  testing info
  testing info
  testing info 
  :::

  \`\`\`bash
  npm i jsonwebtoken
  \`\`\`

  ::: warning 
  testing info
  testing info
  testing info
  testing info
  testing info
  testing info testing info
  testing info
  testing info
  testing info
  testing info testing info
  testing info
  testing info
  testing info
  testing info testing info
  testing info
  testing info
  testing info
  testing info testing info
  testing info
  testing info
  testing info
  testing info testing info
  testing info
  testing info
  testing info
  testing info testing info
  testing info
  testing info
  testing info
  testing info testing info
  testing info
  testing info
  testing info
  testing info 
  :::

  ::: caution
  testing info
  testing info
  testing info
  testing info
  testing info
  testing info testing info
  testing info
  testing info
  testing info
  testing info testing info
  testing info
  testing info
  testing info
  testing info testing info
  testing info
  testing info
  testing info
  testing info testing info
  testing info
  testing info
  testing info
  testing info testing info
  testing info
  testing info
  testing info
  testing info testing info
  testing info
  testing info
  testing info
  testing info testing info
  testing info
  testing info
  testing info
  testing info 
  :::

  > somesomesomesomesomesomesomesomesomesomesomesomesomesomesomesomesomesomesomesome
  somesomesomesomesomesomesomesomesomesomesomesomesomesomesomesomesomesomesomesome
  somesomesomesomesomesomesomesomesomesomesomesomesomesomesomesomesomesomesomesome

  \`\`\`javascript
  import React from "react";
import { Title } from "~/page-title";
import { CourseTable } from "~/course-table";

export function Courses() {
    return (
      <div className="max-w-3xl w-full">
        <Title title="courses" className="capitalize" />
        <div className="mt-12 w-full">
          <CourseTable />
        </div>
      </div>
    );
}
  function str(name) {
    return (name.toString("utf-8"))
  }
  console.log(str("codingsimba"))
  //codingsimba
  // 5 + 5 = 10
  \`\`\`

  \`console.log("inline")\`
  <h1>Hello</h1>

  ~~~python
  def str(name):
      return (str(name))
  ~~~

  <Title title="Python lists" />
  `;

  return json({ content });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  console.log(intent);

  return null;
}

export default function ModuleRoute() {
  const { content } = useLoaderData<typeof loader>();

  return (
    <Container className="max-w-3xl lg:max-w-7xl">
      <BackButton to="/courses/1" buttonText="Introduction to SE" />
      <PageTitle title="Javascript" className="mb-8" />
      <div className="lg:grid lg:grid-cols md:grid-cols-6 gap-6">
        <div className="col-span-4 flex flex-col gap-6 overflow-y-auto h-auto max-h-screen">
          <div className="col-span-3">
            <Markdown source={content} />
            <Iframe videoId="8ee7ba95-7386-4c18-8639-6a0a185d3fe5" />
          </div>
          <hr />
          <Pagination />
        </div>

        {/* mobile screens */}
        <SheetContent className="lg:hidden overflow-y-auto w-full sm:w-auto">
          <ModuleSideContent />
        </SheetContent>

        {/* large screens */}
        <aside className="hidden lg:block col-span-2 border bg-zinc-100 max-h-screen overflow-y-auto">
          <ModuleSideContent />
        </aside>
      </div>
    </Container>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return <ErrorUI error={error} />;
}
