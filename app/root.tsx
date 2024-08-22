import React from "react";
import {
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { RootLayout } from "./components/layouts";
import dark from "highlight.js/styles/night-owl.css?url";
import stylesheet from "./tailwind.css?url";
import { RootErrorUI } from "./components/root-error-ui";
import { getEnv } from "./utils/env.server";

export const links = () => {
  return [
    {
      rel: "icon",
      href: "/favicon.png",
      type: "image/png",
    },
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&family=Mulish&display=swap",
    },
    { rel: "stylesheet", href: stylesheet },
    { rel: "stylesheet", href: dark },
  ].filter(Boolean);
};

export function loader() {
  return { ENV: getEnv() };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <RootLayout />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  return <RootErrorUI error={error} />;
}
