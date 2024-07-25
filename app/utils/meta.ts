import type { MetaFunction } from "@remix-run/node";
import { capitalizeFirstLetter } from "./helpers";

export const metaFn: MetaFunction = ({ matches }) => {
  let pageTitle = "CASBytes";

  if (matches) {
    matches.forEach((match) => {
      if (match.id !== "root" && match.pathname !== "/") {
        if (match.id.includes("Id") || match.id.includes("id")) {
          pageTitle =
            match.pathname.split("/")[1].replace(/-/g, " ") || "CASBytes";
        } else if (match.id.includes("-")) {
          pageTitle = `${match.pathname
            .replace(/\//g, "")
            .replace(/-/g, " ")} | CASBytes`;
        } else if (match.id.includes("_admin")) {
          pageTitle = `${(pageTitle =
            match.pathname.split("/")[3])} | CASBytes`;
        } else {
          pageTitle = `${(pageTitle =
            match.pathname.split("/")[1])} | CASBytes`;
        }
      }
    });
  }

  const title = capitalizeFirstLetter(pageTitle);
  const description =
    "Crafting exceptional software solutions for tomorrow's challenges.";
  const keywords =
    "CASBytes, Software Development, Web Development, Mobile Development";
  const image = `https://cdn.casbytes.com/logo.png`;
  const url = `https://casbytes.com`;
  const pageMeta = [
    { title },
    { name: "description", content: description },
    { name: "keywords", content: keywords },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:keywords", content: keywords },
    { property: "og:image", content: image },
    { property: "og:image:alt", content: title },
    { property: "og:url", content: url },
    { name: "twitter:title", content: title },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: "@casbytes" },
    { name: "twitter:creator", content: "@casbytes" },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
  return pageMeta;
};
