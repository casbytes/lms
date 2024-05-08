import React from "react";
import {
  CheckCircle,
  CircleDotDashed,
  LockKeyhole,
  SigmaSquare,
} from "lucide-react";
import { Badge } from "./ui/badge";

export function Status({ status }: any) {
  const memoizedModuleStatus = React.useMemo(() => {
    if (!status) return { completed: 0, inProgress: 0, locked: 0, total: 0 };
    return status.reduce(
      (acc: any, module: any) => {
        switch (module.status) {
          case "COMPLETED":
            acc.completed++;
            break;
          case "IN_PROGRESS":
            acc.inProgress++;
            break;
          case "LOCKED":
            acc.locked++;
            break;
        }
        acc.total++;
        return acc;
      },
      { completed: 0, inProgress: 0, locked: 0, total: 0 }
    );
  }, [status]);

  return (
    <ul className="gap-4 grid grid-cols-1 sm:grid-cols-2 border-l-4 border-blue-600 text-sm p-2">
      <li className="flex items-center">
        <CheckCircle className="mr-2 text-blue-600" /> Completed:{" "}
        <Badge className="rounded-md ml-2 text-md">
          {memoizedModuleStatus?.completed}
        </Badge>
      </li>
      <li className="flex items-center">
        <CircleDotDashed className="mr-2 text-blue-600" /> In progress:{" "}
        <Badge className="rounded-md ml-2 text-md">
          {memoizedModuleStatus?.inProgress}
        </Badge>
      </li>
      <li className="flex items-center">
        <LockKeyhole className="mr-2 text-slate-400" /> Locked:{" "}
        <Badge className="rounded-md ml-2 text-md">
          {memoizedModuleStatus?.locked}
        </Badge>
      </li>
      <li className="flex items-center">
        <SigmaSquare className="mr-2" /> Total:{" "}
        <Badge className="rounded-md ml-2 text-md">
          {memoizedModuleStatus?.total}
        </Badge>
      </li>
    </ul>
  );
}

export function PendingStatus() {
  return (
    <div className="grid grid-cols-2 gap-4 bg-gray-200 w-full p-2 my-4">
      {Array(4).map((_, i) => (
        <div key={i} className="h-8 bg-gray-300 rounded-md animate-pulse" />
      ))}
    </div>
  );
}
