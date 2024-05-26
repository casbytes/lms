import React from "react";
import { useSearchParams } from "@remix-run/react";
import { ModuleItem } from "./module-item";
import { useLocalStorageState } from "~/utils/hooks";
import { IModuleProgress } from "~/constants/types";

type ModulesProps = {
  modules: IModuleProgress[];
};

export function Modules({ modules }: ModulesProps) {
  const [firstRender, setFirstRender] = useLocalStorageState(
    "moduleFirstRender",
    true
  );

  const [, setSearchParams] = useSearchParams();

  React.useEffect(() => {
    if (firstRender) {
      setSearchParams((params) => {
        params.set("moduleId", modules[0]?.id);
        return params;
      });
      setFirstRender(false);
    }
  }, []);

  return (
    <ul className="space-y-3">
      {modules && modules?.length > 0 ? (
        modules.map((module: any, index: number) => (
          <ModuleItem key={module.id} module={module} index={index} />
        ))
      ) : (
        <li className="text-center text-lg my-4">
          No sub modules in this module.
        </li>
      )}
    </ul>
  );
}
