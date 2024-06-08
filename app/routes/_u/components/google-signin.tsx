import { FaGoogle } from "react-icons/fa";
import { Form, useNavigation } from "@remix-run/react";
import { FaSpinner } from "react-icons/fa6";
import { Button } from "~/components/ui/button";
import { CgSpinnerTwo } from "react-icons/cg";

export function GoogleSignIn({ ...props }) {
  const navigation = useNavigation();
  const isLoading = navigation.formData?.get("intent") === "google-signin";

  return (
    <Form method="POST" action="/google/redirect" className="w-full">
      <input type="hidden" name="intent" value="google-signin" required />
      <Button
        type="submit"
        size="lg"
        className="uppercase text-lg bg-zinc-600 hover:bg-zinc-500 w-full"
        aria-label="continue with google"
        {...props}
        disabled={isLoading}
      >
        {isLoading ? (
          <CgSpinnerTwo className="mr-2 h-6 w-6 animate-spin" />
        ) : (
          <FaGoogle className="mr-2 h-6 w-6" />
        )}{" "}
        google
      </Button>
    </Form>
  );
}
