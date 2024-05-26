import { Link } from "@remix-run/react";
import { FiCheckCircle } from "react-icons/fi";
import { MdQuiz } from "react-icons/md";
import { SlLock } from "react-icons/sl";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ITest, TestStatus } from "~/constants/types";
import { cn } from "~/libs/shadcn";
import { capitalizeFirstLetter } from "~/utils/cs";

type TestProps = {
  test: ITest;
};

export function Test({ test }: TestProps) {
  const CUT_OFF_SCORE = 80;
  const locked =
    test.status === TestStatus.LOCKED ||
    (test.attempted === true && test.score < CUT_OFF_SCORE);

  return (
    <Button
      disabled={locked}
      className="rounded-md text-black bg-stone-200 hover:bg-stone-300 py-4 relative border-b-2 border-zinc-600 w-full"
    >
      <Link
        to={`/modules/test?testId=${test.id}&moduleId=${test.moduleProgressId}`}
        className="flex flex-1 justify-between items-center p-2"
      >
        <div className="absolute p-1 left-0">
          <MdQuiz
            size={20}
            className={cn("text-zinc-700", {
              "bg-sky-700": test.attempted && test.score >= CUT_OFF_SCORE,
            })}
          />
        </div>
        <div className="text-lg pl-6 overflow-x-auto flex gap-2 items-center">
          {capitalizeFirstLetter(test.title)} <Badge>{test.score} %</Badge>{" "}
          {test?.nextAttemptAt ? (
            <span className="text-sm ml-4">
              Retake in: <Badge>23hrs</Badge>
            </span>
          ) : null}
        </div>
        {locked ? (
          <SlLock size={20} className="absolute sm:static right-2" />
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
