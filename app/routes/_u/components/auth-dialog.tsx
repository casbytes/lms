import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Link } from "@remix-run/react";
import { AuthForm } from "./auth-form";

export function AuthDialogContent() {
  return (
    <DialogContent className="max-w-md bg-sky-600/40 gap-4">
      <DialogHeader>
        <img
          src="https://cdn.casbytes.com/assets/logo.png"
          width={160}
          height={32}
          className="w-40 h-8 mx-auto mb-6"
          alt="CASBytes"
        />
        <DialogTitle className="mx-auto text-xl mb-4">Sign in</DialogTitle>
      </DialogHeader>

      <AuthForm provider="magic-link" label="Email a magic link" />
      <p className="text-sm text-center max-w-xs mx-auto mt-4 text-slate-800">
        To sign in to your account or to create a new one fill in your email
        above and we&apos;ll send you an email with a magic link to get you
        started.
      </p>
      <DialogFooter>
        <p className="text-sm text-center mx-auto mt-6">
          By signing in, you agree to our {""}
          <DialogClose asChild>
            <Link prefetch="intent" to="terms-of-use" className="text-blue-700">
              Terms of use
            </Link>
          </DialogClose>{" "}
          and{" "}
          <DialogClose asChild>
            <Link
              prefetch="intent"
              to="privacy-policy"
              className="text-blue-700"
            >
              Privacy policy
            </Link>
          </DialogClose>{" "}
        </p>
      </DialogFooter>
    </DialogContent>
  );
}
