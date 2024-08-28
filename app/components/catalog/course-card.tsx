import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Image } from "../image";
import { Badge } from "../ui/badge";
import { FaStar } from "react-icons/fa6";
import { Separator } from "../ui/separator";
import type { MetaCourse } from "~/services/sanity/types";
import { capitalizeFirstLetter } from "~/utils/helpers";

type CatalogCardProps = {
  cardActionButton: React.ReactNode;
  course: MetaCourse;
};

export function CourseCard({ cardActionButton, course }: CatalogCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-4">
        <Image
          src={`meta/${course.image}`}
          alt={course.title}
          className="rounded-md mx-auto w-full h-[14rem] object-cover"
        />
        <CardTitle className="font-mono">
          {capitalizeFirstLetter(course.title)}
        </CardTitle>
        <CardDescription>
          {course.description.substring(0, 300)}...
        </CardDescription>
      </CardHeader>
      <CardContent className="-my-2 flex justify-between">
        <Badge>{course.premium ? "premium" : "free"}</Badge>{" "}
        <Badge>
          <FaStar /> <Separator orientation="vertical" className="mx-2" /> 4.5
        </Badge>
      </CardContent>
      <CardFooter className="flex justify-end">{cardActionButton}</CardFooter>
    </Card>
  );
}
