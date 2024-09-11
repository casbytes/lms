import type { MetaFunction } from "@remix-run/node";
import { capitalizeFirstLetter } from "./helpers";

export const metaFn: MetaFunction = ({ matches }) => {
  let pageTitle = "CASBytes";
  let pageDescription =
    "Crafting exceptional software solutions for tomorrow's challenges.";
  let image = `https://cdn.casbytes.com/assets/logo.png`;

  let url = `https://casbytes.com`;

  if (matches) {
    matches.forEach((match) => {
      const pathParts = match.pathname.split("/");
      const mainPart = pathParts[1];

      if (match.id !== "root" && match.pathname !== "/") {
        if (match.id.includes("Id") || match.id.includes("id")) {
          pageTitle = mainPart.replace(/-/g, " ") || "CASBytes";
        } else if (match.id.includes("_admin")) {
          pageTitle = `${pathParts[3]} | CASBytes`;
        } else if (match.id.includes("articles.$slug")) {
          pageTitle = (match.data as { title: string }).title;
          pageDescription = (match.data as { description: string }).description;
          image = (match.data as { image: string }).image;
          url = `https://casbytes.com/${match.pathname}`;
        } else {
          pageTitle = `${mainPart.replace(/-/g, " ")} | CASBytes`;
        }
      }
    });
  }

  const title = capitalizeFirstLetter(pageTitle);
  const keywords =
    "CASBytes, Software Development, Web Development, Mobile Development, software engineering, css, html, javascript, python, reactjs, remix";
  const pageMeta = [
    { title },
    { name: "description", content: pageDescription },
    { name: "keywords", content: keywords },
    { property: "og:title", content: title },
    { property: "og:description", content: pageDescription },
    { property: "og:keywords", content: keywords },
    { property: "og:image", content: image },
    { property: "og:image:alt", content: title },
    { property: "og:url", content: url },
    { name: "twitter:title", content: title },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: "@casbytes" },
    { name: "twitter:creator", content: "@casbytes" },
    { name: "twitter:description", content: pageDescription },
    { name: "twitter:image", content: image },
  ];
  return pageMeta;
};
