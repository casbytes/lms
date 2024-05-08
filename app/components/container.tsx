import React from "react";
import { motion } from "framer-motion";
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
    <motion.section
      id={id}
      ref={ref}
      className={cn("px-4 w-full h-full mx-auto py-6", className)}
      {...props}
    >
      {children}
    </motion.section>
  );
}
