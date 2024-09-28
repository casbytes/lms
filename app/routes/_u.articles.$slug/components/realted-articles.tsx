import { TbMoodConfuzed } from "react-icons/tb";
import { ArticleCard } from "~/routes/_u.articles._index/components/article-card";
import { Article } from "~/services/sanity/types";

export function RelatedArticles({ articles }: { articles: Article[] }) {
  return (
    <div>
      <h2 className="text-3xl mb-4 font-bold text-slate-900">
        Related Articles
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto">
        {articles?.length ? (
          articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))
        ) : (
          <div className="text-2xl font-mono text-center col-span-2 mt-8">
            <TbMoodConfuzed
              className="mx-auto mb-2 text-slate-400"
              size={100}
            />
            <span className="text-slate-500">
              No related articles for this article.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
