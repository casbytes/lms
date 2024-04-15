import { Link } from "@remix-run/react";
import { Title } from "./title";
import { Button } from "../ui/button";
import {
  FaFacebook,
  FaLinkedin,
  FaSquareXTwitter,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

export function Contact() {
  return (
    <div>
      <Title title="Contact" />
      <div className="text-sm">
        <p>Questions, enquiries, or feedback?</p>
        <p>We'd love to hear from you!</p>
        <p className="text-blue-600">
          <Link to="mailto:support@casbytes.com">support@casbytes.com</Link>
        </p>
        <div className="mt-2 flex items-center gap-2 text-zinc-400">
          <Button
            variant="link"
            className="p-0 m-0"
            asChild
            aria-label="LinkedIn"
          >
            <Link to="https://www.linkedin.com/casbytes">
              <FaLinkedin size={25} />
            </Link>
          </Button>
          <Button
            variant="link"
            className="p-0 m-0"
            asChild
            aria-label="X (formerly Twitter)"
          >
            <Link to="https://youtube.com/casbytes">
              <FaYoutube size={25} />
            </Link>
          </Button>
          <Button
            variant="link"
            className="p-0 m-0"
            asChild
            aria-label="Facebook"
          >
            <Link to="https://www.facebook.com/CASBytes">
              <FaFacebook size={25} />
            </Link>
          </Button>

          <Button
            variant="link"
            className="p-0 m-0"
            asChild
            aria-label="X (formerly Twitter)"
          >
            <Link to="https://twitter.com/casbytes">
              <FaSquareXTwitter size={25} />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
