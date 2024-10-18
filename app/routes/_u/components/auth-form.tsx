import { Form, useNavigation } from "@remix-run/react";
import { BsStars } from "react-icons/bs";
import { CgSpinnerTwo } from "react-icons/cg";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

type SocialButtonProps = {
  provider: string;
  label: string;
  icon?: React.ReactNode;
};

export function AuthForm({
  provider,
  label,
  icon,
  ...props
}: SocialButtonProps) {
  const navigation = useNavigation();
  const isLoading = navigation.formData?.get("intent") === `${provider}-signin`;
  const disabled = navigation.formData?.get("disabled") === "signin";
  return (
    <Form
      name="authForm"
      method="POST"
      action={`/${provider}/redirect`}
      className="w-full"
    >
      <input
        type="hidden"
        name="intent"
        value={`${provider}-signin`}
        required
      />
      <input type="hidden" name="disabled" value="signin" required />
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
            aria-label="Email a magic link"
            className="w-full text-lg"
            disabled={disabled}
          >
            {isLoading ? (
              <CgSpinnerTwo className="mr-2 h-6 w-6 animate-spin" />
            ) : (
              <BsStars className="h-6 w-6 mr-2" />
            )}
            {label}
          </Button>
        </div>
      ) : (
        <Button
          type="submit"
          size="lg"
          className="text-lg bg-zinc-600 hover:bg-zinc-500 w-full flex gap-2"
          aria-label={`continue with ${label}`}
          {...props}
          disabled={disabled}
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
