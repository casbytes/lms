import { BsLockFill, BsUnlockFill } from "react-icons/bs";
import { cn } from "~/libs/shadcn";
import { Badge } from "./ui/badge";
import { useMatches } from "@remix-run/react";

type TitleProps = {
  className?: string;
  title: string;
};

export function PageTitle({ className, title }: TitleProps) {
  const matches = useMatches();
  const isArticle = matches.some((match) => match.id.includes("article"));
  return (
    <h1
      aria-label={title}
      className={cn(
        "px-4 py-2 border-b border-l-8 border-blue-500 text-lg font-mono  w-full capitalize flex justify-between bg-gradient-to-r from-sky-200 to-slate-200/70",
        className
      )}
    >
      {title}{" "}
      {!isArticle ? (
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
      ) : null}
    </h1>
  );
}
