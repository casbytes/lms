import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Cache as Redis } from "~/utils/cache.server";

export function loader() {
  return redirect("/");
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const response = (await request.json()) as {
      status: number;
      body: string;
      sourceBody: string;
      sourceMessageId: string;
    };

    if (response.status < 200 || response.status > 299) {
      return new Response("Failed to publish message to channel", {
        status: 500,
      });
    }

    const numberOfReceivers = await Redis.publish(
      response.sourceMessageId,
      response.body
    );

    console.log(
      "Atob body:",
      atob(response.body),
      "Atob body source:",
      atob(response.sourceBody),
      "JSON body:",
      JSON.parse(atob(response.body)),
      "JSON source body:",
      JSON.parse(atob(response.sourceBody))
    );

    if (numberOfReceivers === 0) {
      return new Response("No subscribers for this message", {
        status: 500,
      });
    }

    return new Response(`Published message to ${response.sourceMessageId}`, {
      status: 200,
    });
  } catch (error) {
    return new Response("Internal server error", { status: 500 });
  }
}
