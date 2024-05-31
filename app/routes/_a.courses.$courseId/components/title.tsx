import React from "react";
import { Await } from "@remix-run/react";
import { PageTitle } from "~/components/page-title";
import { ISubModuleProgress } from "~/constants/types";

type TitleProps = {
  subModules: Promise<ISubModuleProgress[]>;
};

export function Title({ subModules }: TitleProps) {
  return (
    <React.Suspense
      fallback={<PageTitle title="Loading..." className="mb-8" />}
    >
      <Await resolve={subModules}>
        {(subModules) => {
          const moduleTitle = subModules[0]?.moduleProgress?.title;
          const title = moduleTitle ?? "Matters choke!";
          return <PageTitle title={title} className="mb-8" />;
        }}
      </Await>
    </React.Suspense>
  );
}
