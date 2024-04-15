import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { GoogleSignIn } from "./google-signin";
import { GitHubSignIn } from "./github-signin";
import { Link } from "@remix-run/react";

export function AuthModal() {
  return (
    <DialogContent className="max-w-sm bg-sky-600/40 gap-8">
      <DialogHeader>
        <img
          src="/logo.png"
          width={160}
          height={32}
          className="w-40 h-8 mx-auto mb-6"
          alt="CASBytes"
        />
        <DialogTitle className="mx-auto text-xl mb-4">Sign in with</DialogTitle>
      </DialogHeader>
      {/**
       * Google signin
       */}
      <GoogleSignIn />

      {/**
       * Github signin
       */}
      <GitHubSignIn />
      <DialogFooter>
        <p className="text-sm text-center mx-auto">
          By signing in, you agree to our {""}
          <DialogClose asChild>
            <Link to="terms-of-use" className="text-blue-700">
              Terms of use
            </Link>
          </DialogClose>{" "}
          and{" "}
          <DialogClose asChild>
            <Link to="privacy-policy" className="text-blue-700">
              Privacy policy
            </Link>
          </DialogClose>{" "}
        </p>
      </DialogFooter>
    </DialogContent>
  );
}
