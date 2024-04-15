import React from "react";
import { cn } from "~/libs/shadcn";

type ContainerProps = {
  id?: string;
  className?: string;
  children: React.ReactNode;
};

export function Container({
  id = "",
  className = "",
  children,
  ...props
}: ContainerProps) {
  return (
    <section
      className={cn("px-4 w-full h-full mx-auto py-6", className)}
      id={id}
      {...props}
    >
      {children}
    </section>
  );
}
