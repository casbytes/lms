import { Container } from "../container";
import { Product } from "./product";
import { Contact } from "./contact";
import { About } from "./about";
import { Link } from "@remix-run/react";
import { Button } from "../ui/button";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <Container className="bg-slate-200/80 border-t-2">
      <div className="max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mx-auto py-8 md:py-20 text-zinc-500">
        <div className="flex flex-col gap-6">
          <img
            src="https://cdn.casbytes.com/assets/icon.png"
            alt="CASBytes"
            className="w-14 h-14"
            width={56}
            height={56}
          />
          <div className="text-sm">
            <p>&copy;{year} CASBytes.</p>
            <p>All rights reserved.</p>
            <p>
              <Button variant="link" className="p-0 m-0 text-blue-600" asChild>
                <Link to="/terms-of-use">Terms of Use</Link>
              </Button>{" "}
              |{" "}
              <Button variant="link" className="p-0 m-0 text-blue-600" asChild>
                <Link to="/privacy-policy">Privacy Policy</Link>
              </Button>{" "}
            </p>
          </div>
        </div>
        <About />
        <Product />
        <Contact />
      </div>
    </Container>
  );
}
