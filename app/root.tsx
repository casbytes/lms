import React from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import dark from "highlight.js/styles/night-owl.css?url";
import tailwindStylesheetUrl from "./tailwind.css?url";
import { RootLayout } from "./components/layouts";
import { RootErrorUI } from "./components/root-error-ui";
import { getEnv } from "./utils/env.server";
import { OfflineUI } from "./components/offline-ui";

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
    { rel: "stylesheet", href: tailwindStylesheetUrl },
    { rel: "stylesheet", href: dark },
  ].filter(Boolean);
};

export function loader() {
  return { ENV: getEnv() };
}

export function Layout() {
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
        <RootLayout />
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
              __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
            }}
        />
        <Scripts />
      </body>
    </html>
  );
}



export default function App() {
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    setIsOnline(window.navigator.onLine);
    const handleNetworkChange = () => {
      setIsOnline(window.navigator.onLine);
    };

    window.addEventListener("online", handleNetworkChange);
    window.addEventListener("offline", handleNetworkChange);

    return () => {
      window.removeEventListener("online", handleNetworkChange);
      window.removeEventListener("offline", handleNetworkChange);
    };
  }, []);
  return isOnline ? (
    <Outlet />
  ) : (
    <OfflineUI />
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return <RootErrorUI error={error} />;
}
