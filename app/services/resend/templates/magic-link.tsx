import { Button, Heading } from "@react-email/components";
import { Base } from "./base";
import { Link } from "@remix-run/react";
type MagicLinkProps = {
  email: string;
  link: string;
};

export function MagicLink({ email, link }: MagicLinkProps) {
  return (
    <Base>
      <Heading as="h1">
        Click the button below to sign in with your email address {email}.
      </Heading>
      <Link to={link}>
        <Button>SIGN IN</Button>
      </Link>
    </Base>
  );
}
