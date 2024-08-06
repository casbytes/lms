import React from "react";
import { Await } from "@remix-run/react";
import { SubModule } from "./sub-module";
import type { User, SubModule as ISubModule } from "~/utils/db.server";

type SubModulesProps = {
  user: User;
  subModules: Promise<ISubModule[]>;
  isPremium?: boolean;
};

export function SubModules({ subModules, isPremium, user }: SubModulesProps) {
  return (
    <React.Suspense fallback={<PendingSubModules />}>
      <Await resolve={subModules}>
        {(subModules) => (
          <div className="flex flex-col gap-6">
            {subModules?.length ? (
              subModules.map((submodule, index: number) => (
                <SubModule
                  key={submodule.id}
                  submodule={submodule}
                  isPremium={isPremium}
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
      {Array.from({ length: 10 }, (_, i) => (
        <li key={i} className="bg-gray-300 h-8 rounded-md animate-pulse"></li>
      ))}
    </ul>
  );
}
