import React from "react";
import { Html, Head, Container, Tailwind } from "@react-email/components";
type BaseProps = {
  children: React.ReactNode;
};
export function Base({ children }: BaseProps) {
  const year = new Date().getFullYear();
  return (
    <Tailwind>
      <Html lang="en">
        <Head>
          <title>CASBytes</title>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width" />
        </Head>
        <img
          src="https://cdn.casbytes.com/assets/logo.png"
          width={160}
          height={32}
          className="w-40 h-8 mx-auto mb-6"
          alt="CASBytes"
        />
        <Container>{children}</Container>
        <footer>
          <p>© {year} CASBytes</p>
        </footer>
      </Html>
    </Tailwind>
  );
}
