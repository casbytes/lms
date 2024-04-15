import { cn } from "~/libs/shadcn";
import { Button } from "./ui/button";

export function SignOutButton({
  className,
  isOpen,
  icon,
}: {
  className?: string;
  isOpen?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <form method="post" action="/signout" data-testid="sign-out-form">
      <Button
        type="submit"
        variant="link"
        className={cn(
          "flex p-4 self-start gap-4 duration-300 text-lg text-slate-200 hover:text-white",
          className
        )}
      >
        {icon ? icon : null} {isOpen && "Sign Out"}
      </Button>
    </form>
  );
}
