import React from "react";
import {
  Outlet,
  useLoaderData,
  useMatches,
  useSearchParams,
} from "@remix-run/react";
import { Footer } from "~/components/footer";
import { AuthDialogContent } from "./components/auth-dialog";
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
  const matches = useMatches();
  const indexRoute = matches.every((match) => match.pathname === "/");

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
      if (searchParams.has(param) && indexRoute) {
        setSearchParams(
          (params) => {
            params.delete(param);
            return params;
          },
          { preventScrollReset: true }
        );
      }
    }
  }, [indexRoute, searchParams, setSearchParams]);

  return (
    <>
      <Outlet />
      <AuthDialogContent />
      <Footer />
    </>
  );
}
