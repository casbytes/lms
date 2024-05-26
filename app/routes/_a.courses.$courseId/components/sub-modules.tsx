import React from "react";
import { Await } from "@remix-run/react";
import { SubModuleItem } from "./sub-module-item";
import { ISubmoduleProgress } from "~/constants/types";

type SubModulesProps = {
  subModules: Promise<ISubmoduleProgress[]>;
};

export function SubModules({ subModules }: SubModulesProps) {
  return (
    <React.Suspense fallback={<PendingSubModules />}>
      <Await resolve={subModules}>
        {(subModules) => (
          <div className="flex flex-col gap-6">
            {subModules.length > 0 ? (
              subModules.map((item: any, index: number) => (
                <SubModuleItem key={item.id} item={item} index={index} />
              ))
            ) : (
              <div className="text-center text-lg my-4">No submodules</div>
            )}
          </div>
        )}
      </Await>
    </React.Suspense>
  );
}

function PendingSubModules() {
  return (
    <ul className="space-y-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <li key={i} className="bg-gray-300 h-8 rounded-md animate-pulse"></li>
      ))}
    </ul>
  );
}
