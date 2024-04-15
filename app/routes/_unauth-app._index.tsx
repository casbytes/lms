import React from "react";
import {
  type ActionFunctionArgs,
  type MetaFunction,
  redirect,
  json,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { Home } from "~/components/home";
import { client } from "~/utils/api-client.server";
import { useToast } from "~/components/ui/use-toast";
import axios from "axios";

export const meta: MetaFunction = () => {
  return [
    { title: "CASBytes" },
    { name: "description", content: "An onile school for software engineers." },
  ];
};

{
  /**
   * * Capture the error from the query string and throw it for
   * * the root error route to handle if any.
   */
}
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const query = new URL(request.url).searchParams;
    const error = query.get("error");
    if (error) {
      throw new Error(error);
    }
    return null;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(error as string);
    }
  }
}

interface Res {
  authUrl: string;
}

{
  /**
   * * The action function for the unauthenticated app for authentication
   * @param {ActionFunctionArgs} request
   * @returns {Promise<ReturnType<typeof json | typeof redirect>>}
   */
}

/**
 * * The action function for the unauthenticated app for authentication
 * @param {ActionFunctionArgs} request
 * @returns {Promise<ReturnType<typeof json | typeof redirect>>}
 */
// export async function action({ request }: ActionFunctionArgs) {
//   const formData = await request.formData();
//   const intent = formData.get("intent");
//   try {
//     if (intent === "google-signin") {
//       const { data } = await axios.get("/google/redirect");
//       return redirect(data.authUrl, 301);
//     } else if (intent === "github-signin") {
//       const { data } = await axios.get("/github/redirect");
//       return redirect(data.authUrl, 301);
//     } else {
//       return json({ error: { message: "Invalid Intent" } }, 400);
//     }
//   } catch (error) {
//     if (error instanceof Error) {
//       return json({ error: { message: error.message } }, 500);
//     } else {
//       return json({ error: { message: "Unknown error" } }, 500);
//     }
//   }
// }

/**
 * *The index route for the unauthenticated app.
 * @returns {React.ReactElement}
 */
export default function Index() {
  // const actionData = useActionData<typeof action>();
  // const { toast } = useToast();

  // React.useEffect(() => {
  //   if (actionData && actionData.error) {
  //     toast({
  //       variant: "destructive",
  //       title: "Oops! Something went wrong.",
  //       description: actionData.error.message,
  //     });
  //   }
  // }, [actionData?.error, toast]);

  return <Home />;
}
