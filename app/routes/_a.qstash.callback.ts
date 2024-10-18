import { ActionFunctionArgs, redirect } from "@remix-run/node";
import {  Redis } from "~/utils/redis.server";

type Response = {
  status: number;
  body: string;
  sourceBody: string;
  sourceMessageId: string;
};

export function loader() {
  return redirect("/");
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const response = (await request.json()) as Response;

    if (response.status < 200 || response.status > 299) {
      return new Response("Failed to publish message to channel", {
        status: response.status,
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
        status: 400,
      });
    }

    return new Response(`Published response to ${response.sourceMessageId}`, {
      status: 200,
    });
  } catch (error) {
    return new Response("Internal server error", { status: 500 });
  }
}
