import { BsLockFill, BsUnlockFill } from "react-icons/bs";
import { cn } from "~/libs/shadcn";
import { Badge } from "./ui/badge";

type TitleProps = {
  className?: string;
  title: string;
};

export function PageTitle({ className, title }: TitleProps) {
  return (
    <h1
      aria-label={title}
      className={cn(
        "bg-slate-200/70 px-4 py-2 border-b border-l-8 border-blue-500 text-lg  w-full capitalize flex justify-between",
        className
      )}
    >
      {title}{" "}
      <ul className="hidden sm:flex gap-4">
        <li className="flex items-center">
          <Badge className="rounded-md text-sm">
            <BsLockFill size={15} className="mr-2" />
            Free
          </Badge>
        </li>
        <li className="flex items-center">
          <Badge className="rounded-md text-sm">
            <BsUnlockFill size={15} className="mr-2" />
            Premium
          </Badge>
        </li>
      </ul>
    </h1>
  );
}
