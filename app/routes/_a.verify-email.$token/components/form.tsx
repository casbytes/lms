import { Form } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export function VerifyEmailForm() {
  return (
    <Form
      method="post"
      className="flex flex-col gap-4 drop-shadow-md rounded-md p-4 bg-slate-300 border-2 mt-12 md:mt-20"
    >
      <img
        src="https://cdn.casbytes.com/assets/logo.png"
        width={160}
        height={32}
        className="w-40 h-8 mx-auto"
        alt="CASBytes"
      />
      <h1 className="text-xl text-center">Update your profile</h1>
      <Input id="name" name="name" placeholder="Full name" />
      <Button
        name="intent"
        value="verify-email"
        type="submit"
        className="w-full text-lg"
      >
        Submit
      </Button>
    </Form>
  );
}
