import { Form, useNavigation } from "@remix-run/react";
import { CgSpinnerTwo } from "react-icons/cg";
import { FaGithub } from "react-icons/fa";
import { FaSpinner } from "react-icons/fa6";
import { Button } from "~/components/ui/button";

export function GitHubSignIn({ ...props }) {
  const navigation = useNavigation();
  const isLoading = navigation.formData?.get("intent") === "github-signin";

  return (
    <Form method="POST" action="/github/redirect" className="w-full">
      <input type="hidden" name="intent" value="github-signin" required />
      <Button
        type="submit"
        size="lg"
        className="uppercase text-lg bg-zinc-600 hover:bg-zinc-500 w-full"
        aria-label="continue with github"
        {...props}
        disabled={isLoading}
      >
        {isLoading ? (
          <CgSpinnerTwo className="mr-2 h-6 w-6 animate-spin" />
        ) : (
          <FaGithub className="mr-2 h-6 w-6" />
        )}{" "}
        github
      </Button>
    </Form>
  );
}
