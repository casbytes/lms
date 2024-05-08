import React from "react";
import { useSearchParams } from "@remix-run/react";
import { ModuleItem } from "./module-item";

export function Modules({ modules }: any) {
  const [, setSearchParams] = useSearchParams();

  React.useEffect(() => {
    setSearchParams((params) => {
      params.set("moduleId", modules[0]?.id);
      return params;
    });
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
