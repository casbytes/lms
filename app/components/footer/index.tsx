import { Product } from "./product";
import { Contact } from "./contact";
import { About } from "./about";
import { Link } from "@remix-run/react";
import { Button } from "../ui/button";
import { Image } from "../image";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="bg-slate-200/80 border-t-2 px-4 w-full h-full mx-auto py-4"
      data-testid="footer"
    >
      <div className="max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mx-auto py-8 md:py-20 text-zinc-500">
        <div className="flex flex-col gap-6">
          <Image
            src="assets/icon.png"
            alt="CASBytes"
            className="!w-14 !h-14"
            width={56}
            height={56}
          />
          <div className="text-sm">
            <p>&copy;{year} CASBytes.</p>
            <p>All rights reserved.</p>
            <div>
              <Button variant="link" className="p-0 m-0 text-blue-600" asChild>
                <Link to="/terms-of-use" prefetch="intent">
                  Terms of Use
                </Link>
              </Button>{" "}
              |{" "}
              <Button variant="link" className="p-0 m-0 text-blue-600" asChild>
                <Link to="/privacy-policy" prefetch="intent">
                  Privacy Policy
                </Link>
              </Button>{" "}
            </div>
          </div>
        </div>
        <About />
        <Product />
        <Contact />
      </div>
    </footer>
  );
}
