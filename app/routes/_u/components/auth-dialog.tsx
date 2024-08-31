import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Link } from "@remix-run/react";
import { AuthForm } from "./auth-form";
import { FaGithub, FaGoogle } from "react-icons/fa6";
import { Image } from "~/components/image";

export function AuthDialogContent() {
  return (
    <DialogContent className="max-w-md bg-sky-600/40 gap-4">
      <DialogHeader>
        <Image
          src="assets/logo.png"
          className="w-40 h-8 mx-auto mb-6"
          alt="CASBytes"
        />
        <DialogTitle className="mx-auto text-xl mb-4">Sign in</DialogTitle>
      </DialogHeader>

      <AuthForm provider="magic-link" label="Email a magic link" />
      <p className="text-sm text-center max-w-xs mx-auto mt-2 text-slate-800">
        To sign in to your account or to create a new one fill in your email
        above and we&apos;ll send you an email with a magic link to get you
        started.
      </p>

      <div className="flex items-center">
        <hr className="flex-grow border-t border-gray-300" />
        <span className="mx-4 text-gray-700">OR</span>
        <hr className="flex-grow border-t border-gray-300" />
      </div>

      <AuthForm
        provider="google"
        label="Continue with Google"
        icon={<FaGoogle className="mr-2 h-6 w-6" />}
      />
      <AuthForm
        provider="github"
        label="Continue with Github"
        icon={<FaGithub className="mr-2 h-6 w-6" />}
      />

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
