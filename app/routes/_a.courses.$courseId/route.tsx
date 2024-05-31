import { useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs, defer } from "@remix-run/node";
import {
  getModuleBadges,
  getModules,
  getSubModules,
  getTestCheckpointProject,
} from "./utils.server";
import { BackButton } from "~/components/back-button";
import { Container } from "~/components/container";
import { SheetContent } from "~/components/ui/sheet";
import { Separator } from "~/components/ui/separator";
import { SubModules } from "./components/sub-modules";
import { Assessment } from "./components/assessment";
import { CourseSideContent } from "./components/course-side-content";
import { cacheOptions } from "../sessions.server";
import { PageTitle } from "~/components/page-title";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const modules = getModules(request, params);
  const moduleBadges = getModuleBadges(request, params);
  const subModules = getSubModules(request, params);
  const module = await getTestCheckpointProject(request, params);
  return defer({ modules, moduleBadges, subModules, module }, cacheOptions);
}

export default function CoursesRoute() {
  const { modules, moduleBadges, subModules, module } =
    useLoaderData<typeof loader>();
  return (
    <Container className="max-w-3xl lg:max-w-7xl">
      <BackButton to="/dashboard" buttonText="dashboard" />
      <PageTitle title={module?.title ?? "Matters choke!"} className="mb-8" />
      <div className="lg:grid lg:grid-cols lg:grid-cols-5 gap-6">
        <ul className="col-span-3 flex flex-col gap-6 overflow-y-auto h-auto max-h-screen">
          <div className="bg-[url('https://cdn.casbytes.com/assets/elearning2.png')] bg-no-repeat bg-contain">
            <div className="flex flex-col gap-6 bg-slate-100/90">
              <Assessment module={module} />
              <Separator className="bg-sky-700 h-2 rounded-tl-md rounded-br-md" />
              <SubModules subModules={subModules} />
            </div>
          </div>
        </ul>

        {/* mobile screens */}
        <SheetContent className="lg:hidden overflow-y-auto w-full sm:w-auto">
          <CourseSideContent
            modules={modules}
            moduleBadges={moduleBadges}
            module={module}
          />
        </SheetContent>

        {/* large screens */}
        <aside className="hidden lg:block col-span-2 border bg-zinc-100 overflow-y-auto max-h-screen">
          <CourseSideContent
            modules={modules}
            moduleBadges={moduleBadges}
            module={module}
          />
        </aside>
      </div>
    </Container>
  );
}
