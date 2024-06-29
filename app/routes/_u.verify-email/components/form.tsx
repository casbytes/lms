import { Form, Link, useNavigation } from "@remix-run/react";
import { CgSpinnerTwo } from "react-icons/cg";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export function VerifyEmailForm({ email }: { email: string }) {
  const n = useNavigation();
  const isSubmitting = n.formData?.get("intent") === "submit";
  return (
    <Form
      method="post"
      className="flex flex-col gap-8 drop-shadow-md rounded-md p-4 bg-slate-300 border-2 my-12 md:my-20"
    >
      <img
        src="https://cdn.casbytes.com/assets/logo.png"
        width={160}
        height={32}
        className="w-40 h-8 mx-auto"
        alt="CASBytes"
      />
      <h1 className="text-xl text-center">Update your profile</h1>
      <input type="hidden" name="email" value={email} required />
      <Input id="name" name="name" placeholder="Full name" required />
      <Button
        name="intent"
        value="submit"
        type="submit"
        className="w-full text-lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <CgSpinnerTwo className="mr-2 h-6 w-6 animate-spin" />
        ) : null}
        Update
      </Button>
      <p className="text-sm text-center mx-auto">
        By uodating your profile, you agree to our {""}
        <Link prefetch="intent" to="terms-of-use" className="text-blue-700">
          Terms of use
        </Link>
        and{" "}
        <Link prefetch="intent" to="privacy-policy" className="text-blue-700">
          Privacy policy
        </Link>
      </p>
    </Form>
  );
}
