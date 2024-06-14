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

type AuthDialogProps = {
  response: {
    email: string | null;
    success: boolean;
  } | null;
};

export function AuthDialog({ response }: AuthDialogProps) {
  return (
    <DialogContent className="max-w-md bg-sky-600/40 gap-6">
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

      <AuthForm
        provider="magic-link"
        label="Email a login link"
        response={response}
        icon={<FaGoogle className="mr-2 h-6 w-6" />}
      />
      <div className="flex justify-center capitalize">or continue with</div>
      <AuthForm
        provider="github"
        label="Github"
        icon={<FaGithub className="mr-2 h-6 w-6" />}
      />
      <AuthForm
        provider="google"
        label="Google"
        icon={<FaGoogle className="mr-2 h-6 w-6" />}
      />

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
