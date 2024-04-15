import { BackButton } from "~/components/back-button";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { SheetContent } from "~/components/ui/sheet";
import { useRouteError } from "@remix-run/react";
import { ErrorUI } from "~/components/error-ui";
import { CourseSideContent } from "./components/course-side-content";
import { ModuleCard } from "./components/module-card";
import Pagination from "./components/pagination";
import { ActionFunctionArgs } from "@remix-run/node";

export async function loader() {
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  console.log(intent);
  return null;
}

export default function CoursesRoute() {
  return (
    <Container className="max-w-3xl lg:max-w-6xl mt-6">
      <BackButton to="/dashboard" buttonText="dashboard" />
      <PageTitle
        title="introduction to software engineering"
        className="mb-8"
      />
      <div className="lg:grid lg:grid-cols lg:grid-cols-5 gap-6">
        <ul className="col-span-3 flex flex-col gap-6 overflow-y-auto h-auto max-h-screen">
          <div className="bg-[url('/elearning2.png')] bg-no-repeat bg-contain">
            <div className="flex flex-col gap-6 bg-slate-100/90">
              {Array.from({ length: 5 }).map((_, i) => (
                <ModuleCard i={i} key={i} />
              ))}
            </div>
          </div>
          <hr />
          <Pagination />
        </ul>

        {/* mobile screens */}
        <SheetContent className="lg:hidden overflow-y-auto w-full sm:w-auto">
          <CourseSideContent />
        </SheetContent>

        {/* large screens */}
        <aside className="hidden lg:block col-span-2 border bg-zinc-100 overflow-y-auto max-h-screen">
          <CourseSideContent />
        </aside>
      </div>
    </Container>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return <ErrorUI error={error} />;
}
