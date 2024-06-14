import { Form, useNavigation } from "@remix-run/react";
import { BsStars } from "react-icons/bs";
import { CgSpinnerTwo } from "react-icons/cg";
import { VscError } from "react-icons/vsc";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { EmailAlert } from "./email-alert";

type SocialButtonProps = {
  provider: string;
  label: string;
  icon: React.ReactNode;
  response?: {
    email: string | null;
    success: boolean;
  } | null;
};

export function AuthForm({
  response,
  provider,
  label,
  icon,
  ...props
}: SocialButtonProps) {
  const navigation = useNavigation();
  const isLoading = navigation.formData?.get("intent") === `${provider}-signin`;
  return (
    <Form method="POST" action={`/${provider}/redirect`} className="w-full">
      <input
        type="hidden"
        name="intent"
        value={`${provider}-signin`}
        required
      />
      {provider === "magic-link" ? (
        <div className="flex flex-col gap-4">
          <Input
            type="email"
            name="email"
            placeholder="Email address"
            required
          />
          <Button
            size="lg"
            type="submit"
            aria-label="Email addredd"
            className="w-full text-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <CgSpinnerTwo className="mr-2 h-6 w-6 animate-spin" />
            ) : (
              <BsStars className="h-6 w-6 mr-2" />
            )}
            {label}
          </Button>
          {response ? <EmailAlert response={response} /> : null}
        </div>
      ) : (
        <Button
          type="submit"
          size="lg"
          className="uppercase text-lg bg-zinc-600 hover:bg-zinc-500 w-full"
          aria-label={`continue with ${label}`}
          {...props}
          disabled={isLoading}
        >
          {isLoading ? (
            <CgSpinnerTwo className="mr-2 h-6 w-6 animate-spin" />
          ) : (
            icon
          )}{" "}
          {label}
        </Button>
      )}
    </Form>
  );
}
