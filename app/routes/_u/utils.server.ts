import { InternalServerError } from "~/errors";

export async function getResponse(request: Request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email") as string | null;
    const success = url.searchParams.get("success") === "true";
    const error = url.searchParams.get("error") as string | null;
    return {
      email,
      error,
      success,
    };
  } catch (error) {
    throw new InternalServerError("Failed to process request.");
  }
}
