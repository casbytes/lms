import React from "react";
import { types } from "~/utils/db.server";
import { useSearchParams } from "@remix-run/react";
import { Module } from "./module";
import { useLocalStorageState } from "~/utils/hooks";

type ModulesProps = {
  user: types.User;
  modules: types.ModuleProgress[];
};

export function Modules({ modules, user }: ModulesProps) {
  const [firstRender, setFirstRender] = useLocalStorageState(
    "moduleFirstRender",
    true
  );

  const [searchParams, setSearchParams] = useSearchParams();

  React.useEffect(() => {
    if (firstRender) {
      if (!searchParams.get("moduleId") && modules[0]?.id) {
        setSearchParams((params) => {
          params.set("moduleId", modules[0].id);
          return params;
        });
      }
      setFirstRender(false);
    }
  }, [firstRender, setFirstRender, searchParams, setSearchParams, modules]);

  return (
    <ul className="space-y-3">
      {modules && modules?.length ? (
        modules.map((module) => (
          <Module key={module.id} module={module} user={user} />
        ))
      ) : (
        <li className="text-center text-lg my-4">
          No sub modules in this module.
        </li>
      )}
    </ul>
  );
}
