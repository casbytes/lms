import React from "react";
import { SlLock } from "react-icons/sl";
import { FiCheckCircle } from "react-icons/fi";
import { LuCircleDotDashed, LuSigmaSquare } from "react-icons/lu";
import { Badge } from "./ui/badge";
import { Status as IStatus } from "~/constants/enums";
import { BsLockFill, BsUnlockFill } from "react-icons/bs";

type ItemProps = {
  status: IStatus;
};

type ACCProps = {
  completed: number;
  inProgress: number;
  locked: number;
  total: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Status({ status }: any) {
  const memoizedModuleStatus = React.useMemo(() => {
    if (!status) return { completed: 0, inProgress: 0, locked: 0, total: 0 };
    return status.reduce(
      (acc: ACCProps, item: ItemProps) => {
        switch (item.status as IStatus) {
          case IStatus.COMPLETED:
            acc.completed++;
            break;
          case IStatus.IN_PROGRESS:
            acc.inProgress++;
            break;
          case IStatus.LOCKED:
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
        <BsLockFill size={25} className="text-zinc-500 mr-2" />
        <Badge className="rounded-md ml-2 text-md">Free</Badge>
      </li>
      <li className="flex items-center">
        <BsUnlockFill size={25} className="text-zinc-500 mr-2" />
        <Badge className="rounded-md ml-2 text-md">Subscribed</Badge>
      </li>
      <li className="flex items-center">
        <FiCheckCircle size={25} className="mr-2 text-blue-600" />
        Completed:{" "}
        <Badge className="rounded-md ml-2 text-md">
          {memoizedModuleStatus?.completed}
        </Badge>
      </li>
      <li className="flex items-center">
        <LuCircleDotDashed size={25} className="mr-2 text-blue-600" />
        In progress:{" "}
        <Badge className="rounded-md ml-2 text-md">
          {memoizedModuleStatus?.inProgress}
        </Badge>
      </li>
      <li className="flex items-center">
        <SlLock size={25} className="mr-2 text-slate-600" />
        Locked:{" "}
        <Badge className="rounded-md ml-2 text-md">
          {memoizedModuleStatus?.locked}
        </Badge>
      </li>
      <li className="flex items-center">
        <LuSigmaSquare size={25} className="mr-2" />
        Total:{" "}
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
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="h-8 bg-gray-300 rounded-md animate-pulse" />
      ))}
    </div>
  );
}
