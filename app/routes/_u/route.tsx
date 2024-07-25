import React from "react";
import { Outlet, useLoaderData, useSearchParams } from "@remix-run/react";
import { Footer } from "~/components/footer";
import { AuthDialog } from "./components/auth-dialog";
import { ActionFunctionArgs } from "@remix-run/node";
import { toast } from "~/components/ui/use-toast";

export async function loader({ request }: ActionFunctionArgs) {
  const url = new URL(request.url).searchParams;
  const email = url.get("email") as string | null;
  const success = url.get("success") === "true";
  const error = url.get("error") as string | null;
  const response = { email, error, success };
  return { response };
}

export default function UnAuthApp() {
  const { response } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  React.useEffect(() => {
    if (response) {
      if (!response.success) {
        if (response.email && response?.error) {
          toast({
            title: "Failed to send magic link",
            description: response.error,
            variant: "destructive",
          });
        } else if (!response.email && response?.error) {
          toast({
            title: "De play, Invalid token.",
            description: response?.error,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "✨ Magic link sent!",
          description: `A magic link has been sent to ${response.email}`,
        });
      }
    }
  }, [response]);

  React.useEffect(() => {
    const params = ["email", "error", "success"];
    for (const param of params) {
      if (searchParams.has(param)) {
        setSearchParams((params) => {
          params.delete(param);
          return params;
        });
      }
    }
  }, [searchParams, setSearchParams]);

  return (
    <>
      <Outlet />
      <AuthDialog />
      <Footer />
    </>
  );
}
