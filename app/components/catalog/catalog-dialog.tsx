import React from "react";
import { useMatches } from "@remix-run/react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { capitalizeFirstLetter } from "~/utils/helpers";
import { MetaCourse, MetaModule } from "~/services/sanity/types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Image } from "../image";
import { CourseCard } from "./course-card";
import { ModuleCard } from "./module-card";
import { ConfirmationDialog } from "./confirmation-dialog";
import { ReviewsDialog } from "./reviews-dialog";
import { Markdown } from "../markdown";
import { ItemList } from "./item-list";

export function CatalogDialog({
  module,
  course,
  user,
  currentItem,
  cardActionButton,
}: {
  module?: MetaModule;
  course?: MetaCourse;
  user: { subscribed: boolean };
  currentItem: { title: string } | null;
  dialogActionButton?: React.ReactNode;
  cardActionButton?: React.ReactNode;
}) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const item = module ?? (course as MetaCourse);
  const matches = useMatches();
  const isAuth = matches.some((match) => match.id.includes("_a"));
  if (!item) return null;

  return (
    <Dialog>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{capitalizeFirstLetter(item.title!)}</DialogTitle>
          <DialogDescription>
            {course ? (
              <Image
                src={`meta/${course.image}`}
                alt={course.title}
                className="rounded-md mx-auto w-full h-[14rem] object-cover my-4"
              />
            ) : null}
            <Markdown source={item?.description} />
            {course ? (
              <ItemList course={course} />
            ) : (
              <ItemList module={module} />
            )}
            {!isAuth ? (
              <span className="mt-4 font-mono text-xs max-w-xs text-center mx-auto font-black block">
                Sign in to complete your onboarding and start your learning
                journey.
              </span>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <ReviewsDialog
          item={item}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
        />
        <DialogFooter>
          <div className="flex flex-col gap-4 w-full">
            <div className="flex justify-between w-full">
              <Badge>
                {course ? "premium" : module?.premium ? "premium" : "free"}
              </Badge>{" "}
              <Badge
                onClick={() => setIsDialogOpen(true)}
                className="flex gap-2 cursor-pointer"
              >
                {item?.reviews?.length} <span>reviews</span>
              </Badge>
            </div>
            <Button variant={"outline"} asChild className="self-end">
              <DialogClose>Close</DialogClose>
            </Button>
            {isAuth ? (
              <ConfirmationDialog
                user={user}
                currentItem={currentItem}
                module={module ?? undefined}
                course={course ?? undefined}
              />
            ) : null}
          </div>
        </DialogFooter>
      </DialogContent>
      {course ? (
        <CourseCard course={course} cardActionButton={cardActionButton} />
      ) : (
        <ModuleCard module={module} cardActionButton={cardActionButton} />
      )}
    </Dialog>
  );
}
