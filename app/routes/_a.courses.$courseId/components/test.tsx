import { Link } from "@remix-run/react";
import { CircleCheckBig, CircleDotDashed, Lock } from "lucide-react";
import { MdQuiz } from "react-icons/md";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/libs/shadcn";
import { capitalizeFirstLetter } from "~/utils/cs";

export function Test({ test, isActive }: any) {
  const locked =
    test.status === "LOCKED" || (test.attempted === true && test.score < 80);

  return (
    <Button
      disabled={locked || !isActive}
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
              "bg-sky-700": test.attempted && test.score >= 80,
            })}
          />
        </div>
        <div className="text-lg pl-6 overflow-x-auto flex gap-2 items-center">
          {capitalizeFirstLetter(test.title)} <Badge>{test.score} %</Badge>{" "}
          {test?.nextAttemtAt ? (
            <span className="text-sm ml-4">
              Retake in: <Badge>23hrs</Badge>
            </span>
          ) : null}
        </div>
        {locked ? (
          <Lock size={20} className="absolute sm:static right-2" />
        ) : (
          <CircleCheckBig
            size={20}
            className="text-sky-700 absolute sm:static right-2"
          />
        )}
      </Link>
    </Button>
  );
}
