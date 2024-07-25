import { Container } from "~/components/container";
import { VerifyEmailForm } from "./components/form";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getEmail, updateUser } from "./utils.server";
import { metaFn } from "~/utils/meta";

export const meta = metaFn;

export async function loader({ request }: LoaderFunctionArgs) {
  const email = await getEmail(request);
  return json({ email });
}

export async function action({ request }: ActionFunctionArgs) {
  return updateUser(request);
}

export default function VerifyEmailRoute() {
  const { email } = useLoaderData<typeof loader>();
  return (
    <Container className="max-w-md">
      <VerifyEmailForm email={email} />
    </Container>
  );
}
