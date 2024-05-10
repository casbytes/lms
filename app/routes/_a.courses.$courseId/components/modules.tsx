import React from "react";
import { useSearchParams } from "@remix-run/react";
import { ModuleItem } from "./module-item";
import { useLocalStorageState } from "~/utils/hooks";

export function Modules({ modules }: any) {
  const [fR, setFR] = useLocalStorageState("fR", true);

  const [, setSearchParams] = useSearchParams();

  React.useEffect(() => {
    if (fR) {
      setSearchParams((params) => {
        params.set("moduleId", modules[0]?.id);
        return params;
      });
      setFR(false);
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
