import React from "react";
import type { User, Module as IModule } from "~/utils/db.server";
import { useSearchParams } from "@remix-run/react";
import { Module } from "./module";

type ModulesProps = {
  user: User;
  modules: IModule[];
};

export function Modules({ modules, user }: ModulesProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialModuleId = searchParams.has("moduleId");

  React.useEffect(() => {
    if (!initialModuleId && modules[0]?.id) {
      setSearchParams((params) => {
        params.set("moduleId", modules[0].id);
        return params;
      });
    }
  }, [searchParams, setSearchParams, modules, initialModuleId]);

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
