import React from "react";
import { cn } from "~/libs/shadcn";

type ContainerProps = {
  id?: string;
  ref?: React.RefObject<HTMLElement>;
  className?: string;
  children: React.ReactNode;
};

export function Container({
  id = "",
  ref,
  className = "",
  children,
  ...props
}: ContainerProps) {
  return (
    <section
      id={id}
      ref={ref}
      className={cn("px-4 w-full h-full mx-auto py-4", className)}
      {...props}
    >
      {children}
    </section>
  );
}
