import { cn } from "~/libs/shadcn";

type TitleProps = {
  title: string;
  className?: string;
};

export function Title({ title, className }: TitleProps) {
  return (
    <h1
      className={cn(
        "text-lg font-black text-zinc-500 mb-2 mt-5 md:mt-0",
        className,
      )}
    >
      {title}
    </h1>
  );
}
