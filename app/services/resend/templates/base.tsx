import React from "react";
import { Html, Head, Container, Tailwind } from "@react-email/components";
type BaseProps = {
  children: React.ReactNode;
};
export function Base({ children }: BaseProps) {
  return (
    <Tailwind>
      <Html lang="en">
        <Head>
          <title>CASBytes</title>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width" />
        </Head>
        <Container>{children}</Container>
      </Html>
    </Tailwind>
  );
}
