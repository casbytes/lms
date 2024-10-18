import { Link } from "@remix-run/react";
import type { Test } from "~/utils/db.server";
import { format } from "date-fns";
import { FiCheckCircle } from "react-icons/fi";
import { LuCircleDotDashed } from "react-icons/lu";
import { MdQuiz } from "react-icons/md";
import { SlLock } from "react-icons/sl";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/libs/shadcn";
import {
  capitalizeFirstLetter,
  safeParseDate,
  TEST_STATUS,
} from "~/utils/helpers";

type TestProps = {
  test: Test;
};

export function Test({ test }: TestProps) {
  const LOCKED = test.status === TEST_STATUS.LOCKED;
  const AVAILABLE = test.status === TEST_STATUS.AVAILABLE;
  const COMPLETED = test.status === TEST_STATUS.COMPLETED;

  const testUrl = `/test?testId=${test.id}&${
    test?.moduleId
      ? `moduleId=${test.moduleId}`
      : `submoduleId=${test.subModuleId}`
  }`;

  return (
    <Button
      disabled={LOCKED}
      className={cn(
        "rounded-md text-black bg-stone-200 hover:bg-stone-300 py-4 relative border-b-2 border-zinc-600 w-full",
        {
          "border-sky-700": AVAILABLE,
        }
      )}
    >
      <Link
        to={testUrl}
        className="flex flex-1 justify-between items-center p-2"
      >
        <div className="absolute p-1 left-0">
          <MdQuiz
            size={20}
            className={cn("text-zinc-700", {
              "text-sky-700": COMPLETED,
            })}
          />
        </div>
        <div className="text-lg pl-6 overflow-x-auto flex gap-2 items-center">
          {capitalizeFirstLetter(test.title)}{" "}
          <Badge
            className={cn("bg-zinc-600", {
              "bg-sky-600": COMPLETED,
            })}
          >
            {test.score} %
          </Badge>{" "}
          {test?.nextAttemptAt ? (
            <span className="text-sm ml-4">
              Retake on:{" "}
              <Badge>
                {format(
                  safeParseDate(test.nextAttemptAt),
                  "do MMM, 'at' h:mm a"
                )}
              </Badge>
            </span>
          ) : null}
        </div>
        {LOCKED ? (
          <SlLock size={20} className="absolute sm:static right-2" />
        ) : AVAILABLE ? (
          <LuCircleDotDashed
            size={20}
            className="text-sky-700 absolute sm:static right-2"
          />
        ) : (
          <FiCheckCircle
            size={20}
            className="text-sky-700 absolute sm:static right-2"
          />
        )}
      </Link>
    </Button>
  );
}
