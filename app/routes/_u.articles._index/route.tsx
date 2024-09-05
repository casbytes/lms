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

export async function loader() {
  const articles = await getArticles();
  const tags = await getArticleAllArticleTags();
  return { articles, tags };
}

export default function Articles() {
  const { articles, tags } = useLoaderData<typeof loader>();
  const [searchTerm, setSearchTerm] = React.useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const currentSearch = searchParams.get("articles");

  console.log({ currentSearch });

  React.useEffect(() => {
    if (searchTerm) {
      setSearchParams(
        (params) => {
          params.set("articles", encodeURIComponent(searchTerm));
          return params;
        },
        { preventScrollReset: true }
      );
    } else {
      setSearchParams(
        (params) => {
          params.delete("articles");
          return params;
        },
        { preventScrollReset: true }
      );
    }
  }, [currentSearch, searchTerm, setSearchParams]);

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
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </Container>
  );
}
