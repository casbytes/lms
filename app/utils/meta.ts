import type { MetaFunction } from "@remix-run/node";
import { capitalizeFirstLetter } from "./helpers";

interface MatchData {
  title?: string;
  description?: string;
  image?: string;
  tags?: string;
}

/**
 * Meta function for the application
 * @param {Matches} matches - The matches object
 * @returns {MetaFunction} - The meta function
 * @see https://remix.run/docs/en/2.12.1/route/meta
 * @example
 * export const meta = metaFn;
 */
export const metaFn: MetaFunction = ({ matches }) => {
  let pageTitle = "CASBytes";
  let pageDescription =
    "Crafting exceptional software solutions for tomorrow's challenges.";
  let image = `https://cdn.casbytes.com/assets/logo.png`;
  let url = `https://casbytes.com`;
  let keywords =
    "CASBytes, Software Development, Web Development, Mobile Development, software engineering, css, html, javascript, python, reactjs, remix";

  if (matches && matches.length > 0) {
    matches.forEach((match) => {
      const { pathname, id, data } = match;
      const pathParts = pathname.split("/");
      const mainPart = pathParts[1];

      if (id === "root" || pathname === "/") return;

      if (id.includes("Id") || id.includes("id")) {
        pageTitle = mainPart.replace(/-/g, " ") || "CASBytes";
      } else if (id.includes("_admin")) {
        pageTitle = `${pathParts[3]} | CASBytes`;
      } else if (id.includes("articles.$slug")) {
        const articleData = data as MatchData;
        pageTitle = articleData.title || pageTitle;
        pageDescription = articleData.description || pageDescription;
        image = articleData.image || image;
        url = `https://casbytes.com/${pathname}`;
        keywords = articleData.tags || keywords;
      } else {
        pageTitle = `${mainPart.replace(/-/g, " ")} | CASBytes`;
      }
    });
  }

  const title = capitalizeFirstLetter(pageTitle);

  return [
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
};
