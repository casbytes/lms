import React from "react";
import { Form, useLocation } from "@remix-run/react";
import { cn } from "~/libs/shadcn";
import { Button } from "./ui/button";

type SignOutButtonProps = {
  className?: string;
  isOpen?: boolean;
  icon?: React.ReactNode;
};

export function SignOutButton({ className, isOpen, icon }: SignOutButtonProps) {
  /**
   * This is to keep track of the current URL
   * so that we can redirect the user back to the
   * page they were on before signing out.
   */
  const [currentUrl, setCurrentUrl] = React.useState("");
  const location = useLocation();

  React.useEffect(() => {
    const cUrl = location?.search
      ? location.pathname + location.search
      : location.pathname;
    setCurrentUrl(cUrl);
  }, [location]);

  return (
    <Form method="post" action="/signout" data-testid="sign-out-form">
      <input type="hidden" name="currentUrl" value={currentUrl} />
      <Button
        type="submit"
        name="intent"
        value="signout"
        variant="link"
        className={cn(
          "flex p-4 self-start gap-4 duration-300 text-lg text-slate-200 hover:text-white",
          className
        )}
      >
        {icon ? icon : null} {isOpen && "Sign Out"}
      </Button>
    </Form>
  );
}
