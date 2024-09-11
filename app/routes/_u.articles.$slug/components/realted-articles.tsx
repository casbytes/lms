import { ArticleCard } from "~/routes/_u.articles._index/components/article-card";
import { Article } from "~/services/sanity/types";

export function RelatedArticles({ articles }: { articles: Article[] }) {
  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-900">Related Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto">
        {articles?.length ? (
          articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))
        ) : (
          <div className="text-3xl font-mono text-slate-600 text-center col-span-2 mt-8">
            No related articles for this article.
          </div>
        )}
      </div>
    </div>
  );
}
