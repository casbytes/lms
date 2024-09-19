/* eslint-disable no-console */
import chalk from "chalk";
import { PassThrough } from "node:stream";
import type { HandleDocumentRequestFunction } from "@remix-run/node";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { getInstanceInfo } from "~/utils/litefs.server";
import { getEnv, init } from "./utils/env.server";
// import { server } from "../tests/mocks/node";

const ABORT_DELAY = 5_000;

init();
global.ENV = getEnv();

// if (process.env.NODE_ENV === "test") {
//   server.listen();
// }

type DocRequestArgs = Parameters<HandleDocumentRequestFunction>;
async function setHeaders(responseHeaders: Headers) {
  if (process.env.NODE_ENV !== "production") return;
  const { currentInstance, primaryInstance } = await getInstanceInfo();
  responseHeaders.set("fly-region", process.env.FLY_REGION ?? "unknown");
  responseHeaders.set("fly-app", process.env.FLY_APP_NAME ?? "unknown");
  responseHeaders.set("fly-primary-instance", primaryInstance);
  responseHeaders.set("fly-instance", currentInstance);
}

export default async function handleRequest(...args: DocRequestArgs) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [request, initialStatusCode, responseHeaders, remixContext] = args;
  await setHeaders(responseHeaders);
  return isbot(request.headers.get("user-agent") || "")
    ? handleBotRequest(...args)
    : handleBrowserRequest(...args);
}

export async function handleDataRequest(response: Response) {
  await setHeaders(response.headers);
  return response;
}

function handleBotRequest(...args: DocRequestArgs) {
  const [request, initialStatusCode, responseHeaders, remixContext] = args;
  let responseStatusCode = initialStatusCode;

  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer
        context={remixContext}
        url={request.url}
        abortDelay={ABORT_DELAY}
      />,
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(chalk.red(error));
          }
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

function handleBrowserRequest(...args: DocRequestArgs) {
  const [request, initialStatusCode, responseHeaders, remixContext] = args;
  let responseStatusCode = initialStatusCode;
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer
        context={remixContext}
        url={request.url}
        abortDelay={ABORT_DELAY}
      />,
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(chalk.red(error));
          }
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
