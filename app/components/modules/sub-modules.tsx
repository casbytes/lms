import React from "react";
import { Await } from "@remix-run/react";
import { SubModule } from "./sub-module";
import { ISubModuleProgress, IUser } from "~/constants/types";

type SubModulesProps = {
  user: IUser;
  subModules: Promise<ISubModuleProgress[]>;
};

export function SubModules({ subModules, user }: SubModulesProps) {
  return (
    <React.Suspense fallback={<PendingSubModules />}>
      <Await resolve={subModules}>
        {(subModules) => (
          <div className="flex flex-col gap-6">
            {subModules.length ? (
              subModules.map((submodule, index: number) => (
                <SubModule
                  key={submodule.id}
                  submodule={submodule}
                  user={user}
                  index={index}
                />
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
