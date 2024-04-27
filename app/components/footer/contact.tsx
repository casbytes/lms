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
            <Link target="_blank" to="https://www.linkedin.com/company/casdev">
              <FaLinkedin size={25} />
            </Link>
          </Button>
          <Button
            variant="link"
            className="p-0 m-0"
            asChild
            aria-label="Youtube"
          >
            <Link target="_blank" to="https://youtube.com/@casbytes">
              <FaYoutube size={25} />
            </Link>
          </Button>
          <Button
            variant="link"
            className="p-0 m-0"
            asChild
            aria-label="Facebook"
          >
            <Link target="_blank" to="https://www.facebook.com/casbytes">
              <FaFacebook size={25} />
            </Link>
          </Button>

          <Button
            variant="link"
            className="p-0 m-0"
            asChild
            aria-label="X (formerly Twitter)"
          >
            <Link target="_blank" to="https://twitter.com/casbytes">
              <FaSquareXTwitter size={25} />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
