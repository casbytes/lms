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
import { Markdown } from "../markdown";

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
        <CardTitle className="font-mono -mb-2">
          {capitalizeFirstLetter(course.title)}
        </CardTitle>
        <CardDescription>
          <div className="-mt-5">
            <Markdown source={`${course.description.substring(0, 300)}...`} />
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="-mb-2 -mt-4 flex justify-between">
        <Badge>premium</Badge>{" "}
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
