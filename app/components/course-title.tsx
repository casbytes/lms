import { cn } from "~/libs/shadcn";

type CourseTitleProps = {
  title: string;
  className?: string;
};

export function CourseTitle({ title, className }: CourseTitleProps) {
  return (
    <h1
      className={cn(
        "text-md text-slate-100  bg-gradient-to-r from-zinc-600 to-zinc-400 rounded-t-md mb-2 p-2",
        className
      )}
      aria-label={title}
    >
      {title}
    </h1>
  );
}
