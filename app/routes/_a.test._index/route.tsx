import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { BackButton } from "~/components/back-button";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { Button } from "~/components/ui/button";
import { Rules } from "./components/rules";
import { getTest } from "./utils.server";
import { metaFn } from "~/utils/meta";

export const meta = metaFn;

export async function loader({ request }: LoaderFunctionArgs) {
  return await getTest(request);
}

export default function TestIndexRoute() {
  const test = useLoaderData<typeof loader>();
  const moduleTest = test?.moduleId ? true : false;

  const defaultTitle = "Matters choke!";
  const testTitle = test.title ?? defaultTitle;

  const moduleOrSubModuleTitle = moduleTest
    ? test?.module?.title
    : test?.subModule?.title ?? defaultTitle;

  const moduleOrSubModuleUrl = moduleTest
    ? `/courses/${test?.module?.courseId}?moduleId=${test?.moduleId}`
    : `/sub-modules/${test?.subModuleId}`;

  return (
    <Container className="max-w-6xl bg-header-2 bg-no-repeat min-h-screen relative">
      <div className="mx-auto min-h-screen">
        <BackButton
          to={moduleOrSubModuleUrl}
          buttonText={moduleOrSubModuleTitle}
          className="-mt-2 -mb-1"
        />
        <PageTitle title={`Test Your Knowledge: ${moduleOrSubModuleTitle}`} />
        <div className="flex flex-col md:flex-row gap-2 mt-4 items-center">
          <div className="flex flex-col gap-2 z-20">
            <p className="text-lg text-zinc-700">
              Welcome to the <span className="text-sky-600">{testTitle}!</span>{" "}
              <br />
              This test is designed to assess your understanding of{" "}
              {moduleOrSubModuleTitle}.
            </p>
            <Rules />
          </div>
          <div className="absolute right-10 top-40 -z-20">
            <img
              src="https://cdn.casbytes.com/assets/test.png"
              className="hidden md:block w-[450px] h-[450px] object-cover rounded-lg shadow-sm"
              width={450}
              height={450}
              alt="Test"
            />
          </div>
        </div>
        <Button
          // disabled={test.status === TestStatus.LOCKED}
          className="mt-4 w-full text-lg"
          size="lg"
        >
          <Link
            to={`/test/${test.id}?${
              test?.moduleId
                ? `moduleId=${test.moduleId}`
                : `submoduleId=${test.subModuleId}`
            }`}
            className="w-full"
          >
            Start Test
          </Link>
        </Button>
      </div>
    </Container>
  );
}
