import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Image } from "./image";
import { Badge } from "./ui/badge";
import { FaStar } from "react-icons/fa6";
import { Separator } from "./ui/separator";

type CatalogCardProps = {
  button: React.ReactNode;
};

export function CatalogCard({ button }: CatalogCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-4">
        <Image
          cdn={false}
          src="https://letsenhance.io/static/73136da51c245e80edc6ccfe44888a99/1015f/MainBefore.jpg"
          alt="book"
          className="rounded-md mx-auto"
        />
        <CardTitle className="font-mono">Course Catalog</CardTitle>
        <CardDescription>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec
          odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla
          quis sem at nibh elementum imperdiet.
        </CardDescription>
      </CardHeader>
      <CardContent className="-my-2 flex justify-between">
        <Badge>Free</Badge>{" "}
        <Badge>
          <FaStar /> <Separator orientation="vertical" className="mx-2" /> 4.5
        </Badge>
      </CardContent>
      <CardFooter className="flex justify-end">{button}</CardFooter>
    </Card>
  );
}
