import { Link } from "@remix-run/react";
import { FaArrowLeft } from "react-icons/fa6";
import { cn } from "~/libs/shadcn";
import { Button } from "./ui/button";

type BackButtonProps = {
  className?: string;
  buttonText?: string;
  to: string;
  onClick?: () => void;
};

export function BackButton({
  className,
  buttonText,
  to,
  onClick,
}: BackButtonProps) {
  return (
    <Button
      variant="ghost"
      className={cn("text-lg capitalize -ml-4 mb-6", className)}
      asChild
    >
      <Link prefetch="intent" to={to} onClick={onClick}>
        <FaArrowLeft size={30} className="mr-2" />
        {buttonText}
      </Link>
    </Button>
  );
}
