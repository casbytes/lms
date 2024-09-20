import React from "react";
import { Container } from "~/components/container";
import {
  getArticleAllArticleTags,
  getArticles,
} from "~/services/sanity/index.server";
import { ArticleCard } from "./components/article-card";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/libs/shadcn";
import { Input } from "~/components/ui/input";
import { LoaderFunctionArgs } from "@remix-run/node";
import { metaFn } from "~/utils/meta";
import { Button } from "~/components/ui/button";

export const meta = metaFn;

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const searchTerm = url.searchParams.get("articleSearch") ?? "";
  const articleCount = Number(url.searchParams.get("articleCount")) ?? 8;
  const articles = await getArticles(searchTerm, articleCount);
  const tags = await getArticleAllArticleTags();
  return { articles, tags };
}

export default function Articles() {
  const { articles, tags } = useLoaderData<typeof loader>();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [articleCount, setArticleCount] = React.useState(8);

  const [searchParams, setSearchParams] = useSearchParams();
  const currentSearch = searchParams.get("articles");

  React.useEffect(() => {
    setSearchParams(
      (params) => {
        if (searchTerm) {
          params.set("articleSearch", encodeURIComponent(searchTerm));
        } else {
          params.delete("articleSearch");
        }
        return params;
      },
      { preventScrollReset: true }
    );
  }, [searchTerm, setSearchParams]);

  React.useEffect(() => {
    setSearchParams(
      (params) => {
        params.set("articleCount", articleCount.toString());
        return params;
      },
      { preventScrollReset: true }
    );
  }, [articleCount, setSearchParams]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.currentTarget.value);
  }

  return (
    <Container className="max-w-5xl py-12">
      <Input
        type="search"
        name="search"
        id="search"
        placeholder="Search articles"
        value={searchTerm}
        onChange={handleInputChange}
        className="bg-white text-lg"
      />
      <div className="my-6">
        <h2 className="mb-2">Search articles by tags:</h2>
        <div className="flex flex-wrap">
          {tags?.length &&
            tags.map((tag) => (
              <Badge
                onClick={() => setSearchTerm(tag.trim())}
                key={tag}
                className={cn("mr-2 mb-2 text-lg cursor-pointer rounded-3xl", {
                  "bg-white border-sky-600 hover:bg-white text-sky-600":
                    currentSearch && tag.split(",").includes(currentSearch),
                })}
              >
                {tag}
              </Badge>
            ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles?.length ? (
          articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))
        ) : (
          <div className="text-3xl font-mono text-slate-600 text-center col-span-2 mt-8">
            No articles match your search.
          </div>
        )}
      </div>
      <Button
        onClick={() => setArticleCount((count) => count + 4)}
        className="mx-auto block mt-8 text-lg"
        size={"lg"}
        disabled={articleCount >= articles.length}
      >
        {articleCount < articles.length ? "Load More" : "No More Articles"}
      </Button>
    </Container>
  );
}
