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
import type { MetaCourse } from "~/services/sanity/types";
import { capitalizeFirstLetter } from "~/utils/helpers";
import { ReviewsDialog } from "./reviews-dialog";

type CatalogCardProps = {
  cardActionButton: React.ReactNode;
  course: MetaCourse;
};

export function _CourseCard({ cardActionButton, course }: CatalogCardProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
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
        <Badge
          onClick={() => setIsDialogOpen(true)}
          className="flex gap-2 cursor-pointer"
        >
          {course?.reviews?.length} <span>reviews</span>
        </Badge>
      </CardContent>
      <CardFooter className="flex justify-end">{cardActionButton}</CardFooter>
      <ReviewsDialog
        item={course}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      />
    </Card>
  );
}

export const CourseCard = React.memo(_CourseCard);
