import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { BackButton } from "~/components/back-button";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { Button } from "~/components/ui/button";
import { Rules } from "./components/rules";
import { getTest } from "./utils.server";
import { TestStatus } from "~/constants/types";

export async function loader({ request }: LoaderFunctionArgs) {
  const test = await getTest(request);
  return json({ test });
}

export default function TestIndexRoute() {
  const { test } = useLoaderData<typeof loader>();
  const moduleTest = test?.moduleProgressId ? true : false;

  const defaultTitle = "Matters choke!";
  const testTitle = test.title ?? defaultTitle;

  const moduleOrSubModuleTitle = moduleTest
    ? test?.moduleProgress?.title
    : test?.subModuleProgress?.title ?? defaultTitle;

  const moduleOrSubModuleUrl = moduleTest
    ? `/courses/${test?.moduleProgress?.courseProgressId}?moduleId=${test?.moduleProgressId}`
    : `/sub-modules/${test?.subModuleProgressId}`;

  return (
    <Container className="max-w-6xl bg-header-2 bg-no-repeat min-h-screen relative">
      <div className="mx-auto min-h-screen">
        <BackButton
          to={moduleOrSubModuleUrl}
          buttonText={moduleOrSubModuleTitle}
        />
        <PageTitle title={`Test Your Knowledge: ${moduleOrSubModuleTitle}`} />
        <div className="flex flex-col md:flex-row gap-2 mt-4 items-center">
          <div className="flex flex-col gap-6 z-20">
            <p className="text-xl text-zinc-700">
              Welcome to the {testTitle}! <br />
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
              test?.moduleProgressId
                ? `moduleId=${test.moduleProgressId}`
                : `submoduleId=${test.subModuleProgressId}`
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
