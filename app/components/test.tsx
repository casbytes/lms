import { Link } from "@remix-run/react";
import { types } from "~/utils/db.server";
import { format } from "date-fns";
import { FiCheckCircle } from "react-icons/fi";
import { LuCircleDotDashed } from "react-icons/lu";
import { MdQuiz } from "react-icons/md";
import { SlLock } from "react-icons/sl";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/libs/shadcn";
import { capitalizeFirstLetter } from "~/utils/helpers";
import { TestStatus } from "~/constants/enums";

type TestProps = {
  test: types.Test;
};

export function Test({ test }: TestProps) {
  const locked = test.status === TestStatus.LOCKED;
  const available = test.status === TestStatus.AVAILABLE;
  const completed = test.status === TestStatus.COMPLETED;

  const testLink = `/test?testId=${test.id}&${
    test?.moduleProgressId
      ? `moduleId=${test.moduleProgressId}`
      : `submoduleId=${test.subModuleProgressId}`
  }`;

  return (
    <Button
      // disabled={locked}
      className={cn(
        "rounded-md text-black bg-stone-200 hover:bg-stone-300 py-4 relative border-b-2 border-zinc-600 w-full",
        {
          "border-sky-700": available,
          // "border-stone-300": available,
        }
      )}
    >
      <Link
        to={testLink}
        className="flex flex-1 justify-between items-center p-2"
      >
        <div className="absolute p-1 left-0">
          <MdQuiz
            size={20}
            className={cn("text-zinc-700", {
              "bg-sky-700": completed,
            })}
          />
        </div>
        <div className="text-lg pl-6 overflow-x-auto flex gap-2 items-center">
          {capitalizeFirstLetter(test.title)}{" "}
          <Badge
            className={cn("bg-zinc-600", {
              "bg-sky-600": completed,
            })}
          >
            {test.score} %
          </Badge>{" "}
          {test?.nextAttemptAt ? (
            <span className="text-sm ml-4">
              Retake on:{" "}
              <Badge>
                {format(new Date(test.nextAttemptAt), "do MMMM, 'at' h:mm a")}
              </Badge>
            </span>
          ) : null}
        </div>
        {locked ? (
          <SlLock size={20} className="absolute sm:static right-2" />
        ) : available ? (
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
