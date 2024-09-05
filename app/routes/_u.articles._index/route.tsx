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

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const searchTerm = url.searchParams.get("articles") ?? "";
  const articles = await getArticles(searchTerm);
  const tags = await getArticleAllArticleTags();
  return { articles, tags };
}

export default function Articles() {
  const { articles, tags } = useLoaderData<typeof loader>();
  const [searchTerm, setSearchTerm] = React.useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const currentSearch = searchParams.get("articles");

  React.useEffect(() => {
    setSearchParams(
      (params) => {
        if (searchTerm) {
          params.set("articles", encodeURIComponent(searchTerm));
        } else {
          params.delete("articles");
        }
        return params;
      },
      { preventScrollReset: true }
    );
  }, [searchTerm, setSearchParams]);

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
          {tags.map((tag) => (
            <Badge
              onClick={() => setSearchTerm(tag)}
              key={tag}
              className={cn("mr-2 text-lg cursor-pointer rounded-3xl", {
                "bg-white border-sky-600 hover:bg-white text-sky-600":
                  currentSearch && tag.includes(currentSearch),
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
    </Container>
  );
}
