import { Container } from "~/components/container";
import { VerifyEmailForm } from "./components/form";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";

export async function loader({ request, params }: LoaderFunctionArgs) {
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  return null;
}

export default function VerifyEmailRoute() {
  return (
    <Container className="max-w-md">
      <VerifyEmailForm />
    </Container>
  );
}
