import { Link } from "@remix-run/react";
import { FaArrowLeft } from "react-icons/fa6";
import { cn } from "~/libs/shadcn";
import { Button } from "./ui/button";

type BackButtonProps = {
  className?: string;
  buttonText?: string;
  to: string;
  children?: React.ReactNode;
};

export function BackButton({
  className,
  buttonText,
  to,
  children,
}: BackButtonProps) {
  return (
    <Button
      variant="ghost"
      className={cn("text-lg capitalize -ml-4 mb-6", className)}
      asChild
    >
      <Link to={to}>
        <FaArrowLeft size={30} className="mr-2" />
        {buttonText}
        {children}
      </Link>
    </Button>
  );
}
