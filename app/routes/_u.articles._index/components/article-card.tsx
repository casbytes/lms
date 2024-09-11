import { Link } from "@remix-run/react";
import { readingTime } from "reading-time-estimator";
import { Image } from "~/components/image";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Article } from "~/services/sanity/types";
import { capitalizeFirstLetter } from "~/utils/helpers";

export function ArticleCard({ article }: { article: Article }) {
  const stats = readingTime(article.content);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-col gap-4">
        <CardTitle className="font-bold text-2xl -mb-4">
          {capitalizeFirstLetter(article.title)}
        </CardTitle>
        <CardDescription>
          {article.description.substring(0, 200)}...
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap -mt-2 mb-4">
          {article.tags?.length &&
            article.tags.split(",").map((tag) => (
              <Badge key={tag} className="mr-2">
                {tag}
              </Badge>
            ))}
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <Image
              cdn={false}
              src={article.author.image}
              alt={article.author.image}
              className="rounded-full w-10 h-10 object-cover"
            />
            <div>
              <p className="text-sm font-bold">Written by</p>
              <p className="text-sm">{article.author.name}</p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-sm font-bold">Reading time</p>
            <p className="text-sm">~ {stats.text}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button className="w-full text-lg" variant={"outline"} asChild>
          <Link to={`/articles/${article.slug}`} prefetch="intent">
            Read More
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
