import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Redis } from "~/utils/redis.server";

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

    const numberOfReceivers = await Redis.publish(
      response.sourceMessageId,
      response.body
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
