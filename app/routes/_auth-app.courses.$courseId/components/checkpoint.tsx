import { Link } from "@remix-run/react";
import { CircleCheckBig, CircleDotDashed, Lock } from "lucide-react";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import { MdQuiz } from "react-icons/md";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/libs/shadcn";
import { capitalizeFirstLetter } from "~/utils/cs";

export function Checkpoint({ checkpoint }: any) {
  const locked = checkpoint.status === "LOCKED";
  const inProgress = checkpoint.status === "IN_PROGRESS";
  const completed = checkpoint.status === "COMPLETED";
  return (
    <Button
      disabled={locked}
      className="rounded-md text-black bg-stone-200 hover:bg-stone-300 py-4 relative border-b-2 border-zinc-600 w-full"
    >
      <Link
        to={`/modules/checkpoint/${checkpoint.id}`}
        className="flex flex-1 justify-between items-center p-2"
      >
        <div className="absolute p-1 left-0">
          <IoShieldCheckmarkSharp
            size={20}
            className={cn("text-zinc-700", {
              "text-sky-700": completed,
            })}
          />
        </div>
        <p className="text-lg pl-6 overflow-x-auto flex gap-2 items-center">
          {capitalizeFirstLetter(checkpoint.title)}{" "}
          <Badge>{checkpoint.score} %</Badge>
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
  );
}
