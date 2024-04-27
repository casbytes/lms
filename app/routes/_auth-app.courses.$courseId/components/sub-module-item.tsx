import { Link } from "@remix-run/react";
import { CircleCheckBig, CircleDotDashed, Lock } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/libs/shadcn";
import { capitalizeFirstLetter } from "~/utils/cs";
import { FaCheckSquare } from "react-icons/fa";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import { MdQuiz } from "react-icons/md";

export function SubModuleItem({ item, index }: any) {
  const locked = item.status === "LOCKED";
  const inProgress = item.status === "IN_PROGRESS";
  const completed = item.status === "COMPLETED";

  return (
    <>
      <Button
        disabled={locked}
        className="rounded-md text-black bg-stone-200 hover:bg-stone-300 py-4 relative border-b-2 border-zinc-600"
      >
        <Link
          to={`/sub-modules/${item.id}`}
          className="flex flex-1 justify-between items-center p-2"
        >
          <div
            className={cn(
              "absolute rounded-tl rounded-br text-slate-50 text-xs p-1 bg-zinc-600 top-0 left-0",
              {
                "bg-sky-600": completed,
              }
            )}
          >
            {index + 1}
          </div>
          <p className="text-lg pl-6 overflow-x-auto flex gap-4 items-center">
            {capitalizeFirstLetter(item.title)}
            {item.title === "checkpoint" ? (
              <IoShieldCheckmarkSharp className="text-green-700" />
            ) : item.title === "test" ? (
              <MdQuiz className="text-blue-700" />
            ) : null}
          </p>
          {locked ? (
            <Lock size={20} className="absolute sm:static right-2" />
          ) : inProgress ? (
            <CircleDotDashed
              size={20}
              className="text-sky-700 absolute sm:static right-2"
            />
          ) : (
            <CircleCheckBig
              size={20}
              className="text-sky-700 absolute sm:static right-2"
            />
          )}
        </Link>
      </Button>

      {/* <TestItem test={test} index={index} /> */}
    </>
  );
}
