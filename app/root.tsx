import React from "react";
import {
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteError,
  useNavigation,
} from "@remix-run/react";
import { RootLayout } from "./components/layouts";
import dark from "highlight.js/styles/night-owl.css?url";
import stylesheet from "./tailwind.css?url";
import { useWindowSize } from "./utils/hooks";
import { cn } from "./libs/shadcn";

import { RootErrorUI } from "./components/root-error-ui";
import { FullPagePendingUI } from "./components/full-page-pending-ui";

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
  ];
};

export function Layout({ children }: { children: React.ReactNode }) {
  const MOBILE_BREAKPOINT = 768;
  const navigation = useNavigation();
  const { width } = useWindowSize();
  const isMobile = width < MOBILE_BREAKPOINT;
  const isLoading = navigation.state !== "idle";
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body
        className={cn("bg-slate-100", {
          "cursor-wait": isLoading && !isMobile,
        })}
      >
        {isLoading && isMobile ? <FullPagePendingUI /> : null}
        {children}
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
