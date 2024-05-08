import React from "react";
import { Await } from "@remix-run/react";
import { PageTitle } from "~/components/page-title";

export function Title({ subModules }: any) {
  return (
    <React.Suspense
      fallback={<PageTitle title="Loading..." className="mb-8" />}
    >
      <Await resolve={subModules}>
        {(subModules) => {
          const moduleTitle = subModules[0]?.module.title;
          const title = moduleTitle ?? "Matters choke!";
          return <PageTitle title={title} className="mb-8" />;
        }}
      </Await>
    </React.Suspense>
  );
}
