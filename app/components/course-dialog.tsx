import React from "react";
import { MetaCourse } from "~/services/sanity/types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { capitalizeFirstLetter } from "~/utils/helpers";
import { Image } from "./image";
import { Badge } from "./ui/badge";
import { FaStar } from "react-icons/fa6";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { CatalogCard } from "./catalog-card";

export default function CourseDialog({
  course,
  dialogButton,
  cardButton,
}: {
  course: MetaCourse;
  dialogButton?: React.ReactNode;
  cardButton: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{capitalizeFirstLetter(course.title)}</DialogTitle>

          <DialogDescription>
            <Image
              src={`meta/${course.image}`}
              alt={course.title}
              className="rounded-md mx-auto w-full h-[14rem] object-cover my-4"
            />
            {course.description}
            <p className="mt-2 font-mono text-xs font-extrabold">
              Sign in to complete your onboarding journey and start learning.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="flex flex-col gap-4 w-full">
            <div className="flex justify-between w-full">
              <Badge>{course.premium ? "Premium" : "free"}</Badge>{" "}
              <Badge>
                <FaStar /> <Separator orientation="vertical" className="mx-2" />{" "}
                4.5
              </Badge>
            </div>
            <Button asChild className="self-end">
              <DialogClose>Close</DialogClose>
            </Button>
            {dialogButton ? dialogButton : null}
          </div>
        </DialogFooter>
      </DialogContent>
      <CatalogCard course={course} button={cardButton} />
    </Dialog>
  );
}
